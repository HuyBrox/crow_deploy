
import User from '../models/user.model.js';
import FlashCard from '../models/flash-card.model.js';

//flashcards
export const getflashcards = async (req, res) => {
    try {
        const user = res.locals.user;
        const flashCardSets = await FlashCard.find({ user: user._id });
        res.render('./page/flashcards/index', {
            title: 'Thẻ học tập',
            flashCardSets,
        });
    } catch (error) {

    }
}
//thêm thẻ
export const newCard = async (req, res) => {
    try {
        const user = res.locals.user;
        const id = req.params.id;
        const { vocabulary, meaning } = req.body;
        const flashCard = await FlashCard.findOne({ _id: id, user: user._id });
        if (!flashCard) {
            throw new Error('Không tìm thấy bộ thẻ!');
        }
        flashCard.cards.push({ vocabulary, meaning });
        await flashCard.save();
        req.flash('success', 'Thêm thẻ thành công!');
        return res.status(200).json({ message: 'Thêm thẻ thành công!' });
    } catch (error) {

    }
}
//thẻ học tập chi tiết
export const getflashcardDetail = async (req, res) => {

    try {
        const user = res.locals.user;
        const cardId = req.params.id;
        const flashCard = await FlashCard.findOne({ _id: cardId, user: user._id });
        if (!flashCard) {
            req.flash('error', 'Không tìm thấy bộ thẻ!');
            return res.redirect('/flashcards');
        }
        res.render('./page/flashcards/card', {
            title: "Thẻ " + flashCard.name,
            flashCard,
        });
    } catch (error) {
        req.flash('error', 'Có lỗi khi tải bộ thẻ!');
        res.redirect('/flashcards');
    }
}
export const getCreateCard = (req, res) => {
    res.render('./page/flashcards/createCard', {
        title: 'Tạo bộ thẻ mới',
        name: '',
        cardsText: ''
    });
};

export const postCreateCard = async (req, res) => {
    try {
        const user = res.locals.user;
        const { name, cardsText } = req.body;
        let cards = [];

        if (cardsText) {
            cards = cardsText.trim().split('\n').map(line => {
                const [vocabulary, meaning] = line.split('-').map(item => item.trim());
                return { vocabulary, meaning };
            }).filter(card => card.vocabulary && card.meaning);
        }

        if (!name || cards.length === 0) {
            throw new Error('Vui lòng nhập tên bộ thẻ và ít nhất một thẻ hợp lệ!');
        }

        const flashCard = new FlashCard({
            name,
            cards,
            user: user._id,
        });

        await flashCard.save();
        req.flash('success', 'Tạo bộ thẻ thành công!');
        res.redirect('/flashcards');
    } catch (error) {
        req.flash('error', error.message || 'Có lỗi khi tạo bộ thẻ');
        res.render('./page/flashcards/createCard', {
            title: 'Tạo bộ thẻ mới',
            name: req.body.name || '',
            cardsText: req.body.cardsText || ''
        });
    }
};

//xóa thẻ và xóa bộ thẻ
export const deleteCard = async (req, res) => {
    try {
        const user = res.locals.user;
        const cardId = req.params.id;
        const flashCard = await FlashCard.findOne({ 'cards._id': cardId, user: user._id });
        if (!flashCard) {
            throw new Error('Không tìm thấy thẻ!');
        }
        flashCard.cards = flashCard.cards.filter(card => card._id.toString() !== cardId);
        await flashCard.save();
        req.flash('success', 'Xóa thẻ thành công!');
        res.redirect('/flashcards');
    } catch (error) {
        req.flash('error', 'Có lỗi khi xóa thẻ!');
        res.redirect('/flashcards');
    }
};
export const deleteFlashCard = async (req, res) => {
    try {
        const user = res.locals.user;
        console.log('User:', user);
        if (!user || !user._id) {
            req.flash('error', 'Unauthorized');
            return res.redirect('/flashcards');
        }

        const flashCardId = req.params.id;
        console.log('Flashcard ID:', flashCardId);

        const flashCard = await FlashCard.findOne({ _id: flashCardId, user: user._id });
        console.log('Found flashcard:', flashCard);
        if (!flashCard) {
            req.flash('error', 'Không tìm thấy bộ thẻ!');
            return res.redirect('/flashcards');
        }

        await flashCard.deleteOne();
        console.log('Flashcard deleted');

        req.flash('success', 'Xóa bộ thẻ thành công!');
        return res.redirect('/flashcards');
    } catch (error) {
        console.error('Error in deleteFlashCard:', error);
        req.flash('error', 'Có lỗi khi xóa bộ thẻ!');
        return res.redirect('/flashcards');
    }
};

export const baiTapTuVung = async (req, res) => {
    const { id } = req.params;
    try {
        const flashcard = await FlashCard.findById(id);
        if (!flashcard) {
            req.flash('error', 'Không tìm thấy bộ flashcard');
            return res.redirect('/flashcards');
        }
        // Lấy danh sách các card
        let cardsData = flashcard.cards.map(card => ({
            vocabulary: card.vocabulary,
            meaning: card.meaning
        }));

        // Xáo trộn mảng cardsData
        for (let i = cardsData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardsData[i], cardsData[j]] = [cardsData[j], cardsData[i]];
        }

        // Nếu số thẻ không chia đôi, chúng ta chia theo số lượng tối đa chẵn
        const half = Math.floor(cardsData.length / 2);

        // 5 thẻ đầu: câu hỏi là vocabulary, người dùng nhập meaning
        const group1 = cardsData.slice(0, half).map(card => ({
            question: card.vocabulary,
            answer: card.meaning,
            mode: 'vocab-to-meaning'
        }));

        // 5 thẻ tiếp theo: câu hỏi là meaning, người dùng nhập vocabulary
        const group2 = cardsData.slice(half, half * 2).map(card => ({
            question: card.meaning,
            answer: card.vocabulary,
            mode: 'meaning-to-vocab'
        }));

        // Gộp 2 nhóm lại thành 1 mảng quiz
        const quiz = [...group1, ...group2];
        req.flash('success', 'Bắt đầu bài ôn luyện!');
        return res.render('./page/flashcards/review', { quiz, flashcard });
    } catch (error) {
        console.error('Lỗi khi lấy flashcard:', error);
        req.flash('error', 'Lỗi server khi tải bài ôn luyện');
        return res.redirect('/flashcards');
    }
};