'use server';

import { getCache, setCache } from '@/lib/cache';
import { incSearchCount } from '@/lib/db';
import { getLLM, Message } from '@/lib/llm/llm';
import { getHistory, streamResponse } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { GPT_4o_MIMI } from '@/lib/model';
import { getSearchEngine, IMAGE_LIMIT, TEXT_LIMIT } from '@/lib/search/search';
import { saveSearch } from '@/lib/store/search';
import { directlyAnswer } from '@/lib/tools/answer';
import { getRelatedQuestions } from '@/lib/tools/related';
import {
    Message as StoreMessage,
    SearchCategory,
    TextSource,
} from '@/lib/types';
import { generateId } from 'ai';

export async function indieMakerSearch(
    messages: StoreMessage[],
    isPro: boolean,
    userId: string,
    onStream?: (...args: any[]) => void,
    model = GPT_4o_MIMI,
) {
    try {
        const newMessages = messages.slice(-1) as Message[];
        const query = newMessages[0].content;

        const imageFetchPromise = getSearchEngine({
            categories: [SearchCategory.IMAGES],
        })
            .search(query)
            .then((results) =>
                results.images
                    .filter((img) => img.image.startsWith('https'))
                    .slice(0, IMAGE_LIMIT),
            );

        const domains = [
            'indiehackers.com',
            'producthunt.com',
            'news.ycombinator.com',
        ];
        const randomIndex = Math.floor(Math.random() * domains.length);
        const domain = domains[randomIndex];
        const source = SearchCategory.INDIE_MAKER;
        const searchOptions = {
            domain: domain,
            categories: [source],
        };

        let texts: TextSource[] = [];
        const cacheResult = await getCache(query + domain);
        if (cacheResult) {
            texts = cacheResult.texts;
        } else {
            const searchResult =
                await getSearchEngine(searchOptions).search(query);
            texts = searchResult.texts.slice(0, TEXT_LIMIT);
            setCache(query + domain, { texts });
        }

        await streamResponse(
            { sources: texts, status: 'Thinking ...' },
            onStream,
        );

        let history = getHistory(isPro, messages);
        let fullAnswer = '';
        let rewriteQuery = query;

        await directlyAnswer(
            isPro,
            source,
            history,
            getLLM(model),
            rewriteQuery,
            texts,
            (msg) => {
                fullAnswer += msg;
                onStream?.(
                    JSON.stringify({
                        answer: msg,
                        status: 'Answering ...',
                    }),
                );
            },
        );

        const fetchedImages = await imageFetchPromise;
        const images = [...fetchedImages];
        await streamResponse({ images: images }, onStream);

        let fullRelated = '';
        await getRelatedQuestions(rewriteQuery, texts, (msg) => {
            fullRelated += msg;
            onStream?.(
                JSON.stringify({
                    related: msg,
                    status: 'Generating related questions ...',
                }),
            );
        });

        incSearchCount(userId).catch((error) => {
            console.error(
                `Failed to increment search count for user ${userId}:`,
                error,
            );
        });

        if (userId) {
            messages.push({
                id: generateId(),
                role: 'assistant',
                content: fullAnswer,
                sources: texts,
                images: images,
                related: fullRelated,
            });

            await saveSearch(
                {
                    id: messages[0].id,
                    title: messages[0].content.substring(0, 50),
                    createdAt: new Date(),
                    userId: userId,
                    messages: messages,
                },
                userId,
            );
        }
        onStream?.(null, true);
    } catch (error) {
        logError(error, 'indie-search');
        onStream?.(null, true);
    }
}
