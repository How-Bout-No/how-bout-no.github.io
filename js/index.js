document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Add a click event on each of them
    $navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {

            // Get the target from the "data-target" attribute
            const target = el.dataset.target;
            const $target = document.getElementById(target);

            // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
            el.classList.toggle('is-active');
            $target.classList.toggle('is-active');

            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.navbar-item[href], .button[href]').forEach(item => {
                if (item.getAttribute('href') === currentPage) {
                    item.classList.add('is-active');
                }
            });

            document.querySelectorAll('.navbar-item[href], .button[href]').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.navbar-burger.is-active').forEach(burger => {
                        burger.classList.remove('is-active');
                        burger.setAttribute('aria-expanded', false);
                        const menu = document.getElementById(burger.dataset.target);
                        if (menu) menu.classList.remove('is-active');
                    });
                });
            });

        });
    });

    if (window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.card, .pfp').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();

                // Mouse position relative to element center (-0.5 to 0.5)
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                // Convert to rotation degrees (adjust multiplier for intensity)
                const rotateX = (-y * 20).toFixed(2);  // tilt up/down
                const rotateY = (x * 20).toFixed(2);   // tilt left/right

                el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.048)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }
});