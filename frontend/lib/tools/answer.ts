import { StreamHandler } from '@/lib/llm/llm';
import { HackerNewsPrompt, SummaryPrompt } from '@/lib/llm/prompt';
import { choosePrompt, getMaxOutputToken } from '@/lib/llm/utils';
import { logError } from '@/lib/log';
import { SearchCategory, TextSource } from '@/lib/types';
import { LanguageModel, streamText } from 'ai';
import util from 'util';

export async function directlyAnswer(
    isPro: boolean,
    source: SearchCategory,
    history: string,
    model: LanguageModel,
    query: string,
    searchContexts: TextSource[],
    onStream: StreamHandler,
) {
    try {
        const system = promptFormatterAnswer(source, searchContexts, history);
        // console.log('directlyAnswer:', system);
        const maxTokens = getMaxOutputToken(isPro);
        try {
            const result = await streamText({
                model: model,
                system: system,
                prompt: query,
                maxTokens: maxTokens,
                temperature: 0.1,
            });

            for await (const text of result.textStream) {
                onStream?.(text, false);
            }
        } catch (error) {
            logError(error, `llm-${model.modelId}`);
        }
    } catch (err: any) {
        logError(err, 'llm');
        onStream?.(`Some errors seem to have occurred, plase retry`, true);
    }
}

function promptFormatterAnswer(
    source: SearchCategory,
    searchContexts: any[],
    history: string,
) {
    if (source === SearchCategory.HACKER_NEWS) {
        return util.format(
            HackerNewsPrompt,
            JSON.stringify(searchContexts, null, 2),
        );
    } else if (source === SearchCategory.WEB_PAGE) {
        return util.format(
            SummaryPrompt,
            JSON.stringify(searchContexts, null, 2),
        );
    }
    const context = searchContexts
        .map((item, index) => `[citation:${index + 1}] ${item.content}`)
        .join('\n\n');
    let prompt = choosePrompt(source);
    return util.format(prompt, context, history);
}
