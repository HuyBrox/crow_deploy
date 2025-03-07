document.addEventListener('DOMContentLoaded', function() {
    const user = document.getElementById('user');
    const imgQuocKy = document.getElementById('quocKy');
    switch (user.nationality) {
        case 'Vietnam':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/vn.png';
            break;
        case 'Japan':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/jp.png';
            break;
        case 'China':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/cn.png';
            break;
        case 'USA':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/us.png';
            break;
        case 'England':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/gb.png';
            break;
        case 'Korea':
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/kr.png';
            break;
        default:
            imgQuocKy.src = 'https://tienichhay.net/uploads/flags/shiny/48x48/vn.png';
            break;
    }
});
/*editor chỉnh sửa*/

