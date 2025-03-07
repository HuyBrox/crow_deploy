import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as PlayHT from 'playht';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import FlashCard from '../models/flash-card.model.js';
dotenv.config();
const router = express.Router();

const apiKeys = [
    { userId: process.env.PLAY_HT_USER_ID, apiKey: process.env.PLAY_HT_API_KEY },
    { userId: process.env.PLAY_HT_USER_ID_1, apiKey: process.env.PLAY_HT_API_KEY_1 },
    { userId: process.env.PLAY_HT_USER_ID_2, apiKey: process.env.PLAY_HT_API_KEY_2 },
    { userId: process.env.PLAY_HT_USER_ID_3, apiKey: process.env.PLAY_HT_API_KEY_3 },
    { userId: process.env.PLAY_HT_USER_ID_4, apiKey: process.env.PLAY_HT_API_KEY_4 },
    { userId: process.env.PLAY_HT_USER_ID_5, apiKey: process.env.PLAY_HT_API_KEY_5 },
    { userId: process.env.PLAY_HT_USER_ID_6, apiKey: process.env.PLAY_HT_API_KEY_6 },
];

let currentKeyIndex = 0;
function getNextApiKey() {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return apiKeys[currentKeyIndex];
}

// Route API
router.post('/api/tts', requireAuth, async (req, res) => {
    const text = req.body.text?.trim() + "   " || 'Đã có lỗi xảy ra';

    let keyData = getNextApiKey();

    while (true) {
        try {
            PlayHT.init({
                userId: keyData.userId,
                apiKey: keyData.apiKey,
            });

            const stream = await PlayHT.stream(text, {
                voiceEngine: 'PlayDialog',
                voice: 'en-US-Briggs',
                outputFormat: 'mp3',
                voiceEngine: "Play3.0-mini"
            });

            const chunks = [];
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('end', () => {
                const audioBuffer = Buffer.concat(chunks);
                res.set('Content-Type', 'audio/mpeg');
                res.send(audioBuffer);

            });

            return;
        } catch (error) {
            if (error.statusCode === 429) {
                console.warn(`API Key ${keyData.userId} bị giới hạn, đổi key...`);
                keyData = getNextApiKey();
            } else {
                console.error('Lỗi TTS:', error);
                return res.status(500).send('Lỗi tạo TTS');
            }
        }
    }
});

// Khởi tạo Gemini API với API Key từ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Route API
router.post('/AI-gen', requireAuth, async (req, res) => {
    try {
        const { question, outputLang = 'en' } = req.body; // Mặc định outputLang là 'en' (tiếng Anh)
        if (!question) {
            return res.status(400).json({ error: 'Câu hỏi không được cung cấp' });
        }
        console.log('Câu hỏi:', question);
        console.log('Ngôn ngữ đầu ra:', outputLang);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Tạo prompt tối ưu để chỉ nhận bản dịch
        const prompt = `Translate the following text into ${outputLang} and return only the translated text, nothing else:\n"${question}"`;

        const result = await model.generateContent(prompt);
        const generatedAnswer = result.response.text().trim();

        return res.status(200).json({ answer: generatedAnswer });
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error.message);
        return res.status(500).send('Lỗi server: ' + error.message);
    }
});
// // Route API gen bài tập từ flashcard
// router.get('/AI-gen-quiz/:id', requireAuth, async (req, res) => {
//     const { id } = req.params;
//     try {
//         const flashcard = await FlashCard.findById(id).populate('cards');
//         if (!flashcard) {
//             req.flash('error', 'Không tìm thấy thẻ từ');
//             return res.redirect('/flashcards');
//         }

//         const cardsData = flashcard.cards.map(card => ({
//             vocabulary: card.vocabulary,
//             meaning: card.meaning,
//         }));
//         if (cardsData.length === 0) {
//             req.flash('error', 'Không có thẻ để gen!');
//             return res.redirect(`/flashcards/${id}`);
//         }

//         const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//         const quiz = {};

//         for (let i = 0; i < cardsData.length; i++) {
//             const { vocabulary, meaning } = cardsData[i];

//             const question = `Nghĩa của từ: "${vocabulary}"?`;

//             const prompt = `
//                 Given the word "${vocabulary}" meaning "${meaning}", generate exactly 3 incorrect meanings for this word (same language as "${meaning}")
//                 Return only 3 incorrect meanings, one per line, without any additional text or explanation.
//             `;
//             const result = await model.generateContent(prompt);
//             const wrongAnswers = result.response.text().trim().split('\n').slice(0, 3);

//             const answers = [
//                 `+${meaning}`,
//                 `-${wrongAnswers[0] || '🤖'}`,
//                 `-${wrongAnswers[1] || '🤖'}`,
//                 `-${wrongAnswers[2] || '🤖'}`,
//             ];

//             // Xáo trộn mảng answers
//             for (let j = answers.length - 1; j > 0; j--) {
//                 const k = Math.floor(Math.random() * (j + 1));
//                 [answers[j], answers[k]] = [answers[k], answers[j]];
//             }

//             quiz[`${i + 1} - ${question}`] = answers;
//         }
//         req.flash('success', 'Rất vui được giúp bạn học từ vựng!');
//         return res.render('./page/flashcards/quiz', { quiz, flashcard });
//     } catch (error) {
//         console.error('Lỗi khi gen bài tập:', error.message);
//         req.flash('error', 'Lỗi khi tạo bài tập');
//         return res.redirect(`/flashcards/`);
//     }
// });
// Route API gen bài tập từ flashcard
router.get('/AI-gen-quiz/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const flashcard = await FlashCard.findById(id).populate('cards');
        if (!flashcard) {
            req.flash('error', 'Không tìm thấy thẻ từ');
            return res.redirect('/flashcards');
        }

        // Lấy danh sách cards và trộn ngay tại đây
        let cardsData = flashcard.cards.map(card => ({
            vocabulary: card.vocabulary,
            meaning: card.meaning,
        }));
        // Xáo trộn cardsData bằng thuật toán Fisher-Yates
        for (let i = cardsData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardsData[i], cardsData[j]] = [cardsData[j], cardsData[i]];
        }

        if (cardsData.length === 0) {
            req.flash('error', 'Không có thẻ để gen!');
            return res.redirect(`/flashcards/${id}`);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // prompt gộp cho tất cả các flashcard
        let prompt = `
*Must do it correctly without mistakes!
For each of the following flashcards, generate exactly 3 incorrect meanings for the given word.
The incorrect meanings must be in the same language as the provided meaning.
If the provided meaning is in Japanese:
  - When the meaning is written in Hiragana, all incorrect answers must be in Hiragana.
  - When the meaning is written in Kanji, all incorrect answers must be in Kanji.
  - When the meaning is written in Katakana, all incorrect answers must be in Katakana.
Output your answer in JSON format as an array of objects, where each object has two keys:
  - "vocabulary" (same as provided)
  - "wrongMeanings": an array of exactly 3 strings.
Do not include any additional text or explanation.
Here is the input flashcards array:
`;
        prompt += JSON.stringify(cardsData);

        const result = await model.generateContent(prompt);
        let rawText = result.response.text().trim();

        // Loại bỏ markdown code fences nếu có
        rawText = rawText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

        let wrongAnswersArray;
        try {
            wrongAnswersArray = JSON.parse(rawText);
        } catch (e) {
            console.error('Failed to parse API response as JSON:', e);
            wrongAnswersArray = [];
        }

        const quiz = {};
        for (let i = 0; i < cardsData.length; i++) {
            const { vocabulary, meaning } = cardsData[i];
            const question = `Nghĩa của từ: "${vocabulary}"?`;
            let wrongAnswers = [];

            if (wrongAnswersArray && wrongAnswersArray[i] && Array.isArray(wrongAnswersArray[i].wrongMeanings)) {
                wrongAnswers = wrongAnswersArray[i].wrongMeanings.slice(0, 3);
            } else {
                wrongAnswers = ['🤖 Xin lỗi, hết kinh phí chạy model', '🤖Xin lỗi, hết kinh phí chạy model', '🤖Xin lỗi, hết kinh phí chạy model'];
            }

            const answers = [
                `+${meaning}`,
                `-${wrongAnswers[0] || '🤖Xin lỗi, hết kinh phí chạy model'}`,
                `-${wrongAnswers[1] || '🤖Xin lỗi, hết kinh phí chạy model'}`,
                `-${wrongAnswers[2] || '🤖Xin lỗi, hết kinh phí chạy model'}`,
            ];

            // Xáo trộn mảng answers
            for (let j = answers.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [answers[j], answers[k]] = [answers[k], answers[j]];
            }

            quiz[`${i + 1} - ${question}`] = answers;
        }

        req.flash('success', 'Rất vui được giúp bạn học từ vựng!');
        return res.render('./page/flashcards/quiz', { quiz, flashcard });
    } catch (error) {
        console.error('Lỗi khi gen bài tập:', error.message);
        req.flash('error', 'Lỗi khi tạo bài tập');
        return res.redirect(`/flashcards/`);
    }
});

export default router;
