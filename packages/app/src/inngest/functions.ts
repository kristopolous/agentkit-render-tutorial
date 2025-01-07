import OpenAI from "openai";
import { z } from "zod";
import { openai } from "inngest";
import {
  createAgent,
  createNetwork,
  createTool,
  getDefaultRoutingAgent,
} from "@inngest/agent-kit";

import { inngest } from "./client";
import { computeNextRunDate } from "./utils";
import { resend } from "../lib/resend";

export const hackerNewsAgent = inngest.createFunction(
  {
    id: "hacker-news-agent",
  },
  { event: "hacker-news-agent/run" },
  async ({ event, db, step }) => {
    console.info("[HackerNewsAgent] Starting execution with data:", {
      interest_id: event.data.interest_id,
      question_id: event.data.question_id,
    });

    const { interest_id, question_id } = event.data;

    const { interest, question } = await step.run(
      "fetch-interest-and-question",
      async () => {
        console.info(
          "[HackerNewsAgent] Fetching interest and question from database"
        );
        const interest = await db.query(
          "SELECT * FROM interests WHERE id = $1 LIMIT 1",
          [interest_id]
        );
        const question = await db.query(
          "SELECT * FROM questions WHERE id = $1 LIMIT 1",
          [question_id]
        );
        console.info("[HackerNewsAgent] Database query results:", {
          interest: interest.rows[0],
          question: question.rows[0],
        });
        return { interest: interest.rows[0], question: question.rows[0] };
      }
    );

    if (!interest || !question) {
      console.warn(
        "[HackerNewsAgent] Interest or question not found, aborting"
      );
      return;
    }

    console.info("[HackerNewsAgent] Creating OpenAI model and agents");
    const model = openai({ model: "gpt-4" });

    const summarizerAgent = createAgent({
      name: "Summarizer Agent",
      description: "Summarize the results of the search agent",
      system: ({ network }) => {
        const searchResults = network?.state.kv.get("search-result");
        const trendsResults = network?.state.kv.get("trends-result");
        const prompt = `
        Prepare the answers to the questions based on the results of the search agent.
        If the user is interested in trends, use the trends-result to answer the questions and provide a summary of the trends.
        If the user is not interested in trends, use the search-result to answer the questions.

        The user is interested in ${
          interest.name
        }. They asked the following questions: 
        <questions>
        ${question.question}
        </questions>

        The search agent found the following results online: 
        <search-results>
        ${(searchResults || []).join(`\n`)}
        </search-results>

        The trends agent found the following trends:
        <trends-results>
        ${(trendsResults || []).join(`\n`)}
        </trends-results>

        Provide you answer wrapped in <answer> tags.
        `;
        return prompt;
      },
      lifecycle: {
        onFinish: async ({ network, result }) => {
          const lastMessage = result.output[result.output.length - 1];
          if (lastMessage.type === "text") {
            const answer = ((lastMessage.content as string) || "").match(
              /<answer>([\s\S]*)<\/answer>/
            )?.[1];
            if (answer) {
              network?.state.kv.set("answers", answer);
            }
          }
          return result;
        },
      },
    });

    const searchAgent = createAgent({
      name: "Search Agent",
      description: "Search Hacker News for a given set of interests",
      system:
        "You are a search agent that searches Hacker News for posts that are relevant to a given set of interests",
      tools: [
        createTool({
          name: "search",
          description: "Search Hacker News for a given set of interests",
          parameters: z.object({
            query: z.string(),
          }),
          handler: async (input, { network }) => {
            // Generate embedding for the search query
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY,
            });

            const embedding = await openai.embeddings.create({
              model: "text-embedding-ada-002",
              input: input.query,
            });

            // Perform vector similarity search
            const searchResults = await db.query(
              `SELECT title, content, date, comments,
                (embedding <=> $1::vector) as distance
              FROM stories
              ORDER BY distance ASC
              LIMIT 5`,
              [`[${embedding.data[0].embedding.join(",")}]`]
            );

            // Format results
            const result = searchResults.rows.map(
              (row) =>
                `Title: ${row.title}\nContent: ${row.content}\nDate: ${row.date}\nComments: ${row.comments}\n\n`
            );

            network?.state.kv.set("search-result", result);

            return result;
          },
        }),
        createTool({
          name: "identify-trends",
          description:
            "Identify trends on Hacker News for a given set of interests",
          parameters: z.object({
            query: z.string(),
          }),
          handler: async (input, { network }) => {
            // Generate embedding for the query
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY,
            });

            const embedding = await openai.embeddings.create({
              model: "text-embedding-ada-002",
              input: input.query,
            });

            // Find similar stories using vector similarity
            const similarStories = await db.query(
              `WITH similar_stories AS (
                SELECT title, content, date, comments,
                  (embedding <=> $1::vector) as distance
                FROM stories
                WHERE (embedding <=> $1::vector) < 0.3
                ORDER BY date DESC
              )
              SELECT 
                date_trunc('day', TO_TIMESTAMP(date, 'MM/DD/YYYY')) as story_date,
                COUNT(*) as story_count,
                STRING_AGG(title, ' | ' ORDER BY date DESC) as titles
              FROM similar_stories
              GROUP BY date_trunc('day', TO_TIMESTAMP(date, 'MM/DD/YYYY'))
              ORDER BY story_date DESC
              LIMIT 10`,
              [`[${embedding.data[0].embedding.join(",")}]`]
            );

            // Format results to show trends
            const result = similarStories.rows.map((row) => {
              const date = new Date(row.story_date).toLocaleDateString();
              return `Date: ${date}\nNumber of Related Stories: ${row.story_count}\nTitles: ${row.titles}\n\n`;
            });

            network?.state.kv.set("trends-result", result);

            return result;
          },
        }),
      ],
    });

    const network = createNetwork({
      agents: [searchAgent.withModel(model), summarizerAgent.withModel(model)],
      defaultModel: model,
      maxIter: 4,
      defaultRouter: ({ network }) => {
        console.debug("[HackerNewsAgent] Router state:", {
          hasAnswers: network?.state.kv.has("answers"),
          hasSearchResult: network?.state.kv.has("search-result"),
          hasTrendsResult: network?.state.kv.has("trends-result"),
        });
        if (network?.state.kv.has("answers")) {
          return;
        } else if (
          network?.state.kv.has("search-result") ||
          network?.state.kv.has("trends-result")
        ) {
          return summarizerAgent;
        }
        return getDefaultRoutingAgent();
      },
    });

    console.info("[HackerNewsAgent] Starting network execution");
    const result = await network.run(
      `I am passionate about ${interest.name}. Answer the following questions: ${question.question}`
    );
    console.info("[HackerNewsAgent] Network execution completed", {
      hasAnswers: result.state.kv.has("answers"),
    });

    if (result.state.kv.has("answers")) {
      await step.run("send-email", async () => {
        console.info("[HackerNewsAgent] Preparing to send email");
        const answers = result.state.kv.get("answers");

        if (!event.data.preview) {
          const { data, error } = await resend.emails.send({
            from: "Hacker News Agent <onboarding@resend.dev>",
            to: interest.email,
            subject: `Your Hacker News Agent Update on ${interest.name}`,
            text: `Here are the answers to "${question.question}":\n\n${answers}`,
          });

          if (error) {
            console.error("[HackerNewsAgent] Error sending email:", error);
            throw error;
          }
          console.info("[HackerNewsAgent] Email sent successfully");
          return data;
        }
      });

      const nextRunDate = computeNextRunDate(question.frequency);
      console.info("[HackerNewsAgent] Scheduling next run", {
        nextRunDate,
        frequency: question.frequency,
      });
      await step.sendEvent("schedule-next-run", {
        name: "hacker-news-agent/run",
        data: {
          interest_id,
          question_id,
        },
        ts: nextRunDate.getTime(),
      });
    }
    console.info("[HackerNewsAgent] Function execution completed");

    return { answers: result.state.kv.get("answers") };
  }
);
