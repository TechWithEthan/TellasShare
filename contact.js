
    /* Custom cursor */
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursorRing');
    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    (function animRing() {
        rx += (mx - rx) * 0.13;
        ry += (my - ry) * 0.13;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(animRing);
    })();

    document.querySelectorAll('a, button, .chip, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width  = '6px';
            cursor.style.height = '6px';
            ring.style.width    = '56px';
            ring.style.height   = '56px';
            ring.style.borderColor = 'var(--accent)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width  = '10px';
            cursor.style.height = '10px';
            ring.style.width    = '38px';
            ring.style.height   = '38px';
            ring.style.borderColor = 'var(--ink)';
        });
    });

    /* Chip toggle */
    function toggleChip(el) {
        el.classList.toggle('selected');
    }

    /* Form submit */
    function submitForm() {
        const fname = document.getElementById('fname').value.trim();
        const email = document.getElementById('email').value.trim();

        document.getElementById('fname').style.borderBottomColor = fname ? '' : 'var(--accent)';
        document.getElementById('email').style.borderBottomColor = email ? '' : 'var(--accent)';
        if (!fname || !email) return;

        const wrap = document.getElementById('formWrap');
        wrap.style.transition = 'opacity 0.4s, transform 0.4s';
        wrap.style.opacity    = '0';
        wrap.style.transform  = 'translateY(-20px)';

        setTimeout(() => {
            wrap.style.display = 'none';
            document.getElementById('successMsg').classList.add('show');
        }, 400);
    }