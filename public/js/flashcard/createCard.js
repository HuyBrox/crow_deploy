document.addEventListener('DOMContentLoaded', function () {
    const textarea = document.getElementById('cardsText');
    const preview = document.getElementById('cardPreview');
    const cardCount = document.getElementById('cardCount');
    const form = document.querySelector('form');
    const submitBtn = document.querySelector('.btn-create');

    // Xem trước thẻ khi nhập liệu
    textarea.addEventListener('input', function () {
        const lines = this.value.trim().split('\n');
        preview.innerHTML = '';
        let validCards = 0;

        if (lines.length === 0 || lines[0] === '') {
            preview.innerHTML = '<p class="text-muted text-center">Chưa có thẻ nào được nhập</p>';
            cardCount.textContent = '0 thẻ';
            return;
        }

        lines.forEach((line, index) => {
            const [vocabulary, meaning] = line.split('-').map(item => item.trim());
            if (vocabulary && meaning) {
                validCards++;
                const cardItem = document.createElement('div');
                cardItem.className = 'card-item';
                cardItem.innerHTML = `
                            <span><strong>${vocabulary}</strong> - ${meaning}</span>
                            <button type="button" class="btn-remove" onclick="removeCard(${index})">Xóa</button>
                        `;
                preview.appendChild(cardItem);
            }
        });

        cardCount.textContent = `${validCards} thẻ`;
    });

    // Xóa thẻ
    window.removeCard = function (index) {
        const lines = textarea.value.trim().split('\n');
        lines.splice(index, 1);
        textarea.value = lines.join('\n');
        textarea.dispatchEvent(new Event('input'));
    };

    // Validation và hiệu ứng khi submit
    form.addEventListener('submit', function (e) {
        const name = document.getElementById('name').value.trim();
        const cards = textarea.value.trim().split('\n').filter(line => {
            const [vocabulary, meaning] = line.split('-').map(item => item.trim());
            return vocabulary && meaning;
        });

        if (!name || cards.length === 0) {
            e.preventDefault();
            alert('Vui lòng nhập tên bộ thẻ và ít nhất một thẻ hợp lệ!');
            return;
        }

        submitBtn.innerHTML = 'Đang tạo...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
    });
});