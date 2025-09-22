import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Логика анимации фона
    const canvas = document.getElementById('scrolling-abstraction');
    const ctx = canvas.getContext('2d');
    let lines = [];
    let scrollY = 0;

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 2;
    };

    const initLines = () => {
        lines = [];
        const numLines = 20;
        for (let i = 0; i < numLines; i++) {
            lines.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 100 + 50,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.5,
                color: `hsl(${Math.random() * 360}, 100%, 70%)`
            });
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scrollSpeed = scrollY * 0.001;
        lines.forEach(line => {
            line.x += Math.cos(line.angle) * line.speed + scrollSpeed;
            line.y += Math.sin(line.angle) * line.speed;
            if (line.x > canvas.width + line.length) line.x = -line.length;
            if (line.y > canvas.height + line.length) line.y = -line.length;
            if (line.x < -line.length) line.x = canvas.width + line.length;
            if (line.y < -line.length) line.y = canvas.height + line.length;

            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x + Math.cos(line.angle) * line.length, line.y + Math.sin(line.angle) * line.length);
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = line.opacity;
            ctx.stroke();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', () => { scrollY = window.scrollY; });
    resizeCanvas();
    initLines();
    animate();

    // Настройка Firebase
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    const signIn = async () => {
        try {
id="code_block_id_4"         if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
        console.log("Firebase auth successful.");
    } catch (error) {
        console.error("Firebase Auth Error:", error);
    }
    };
    signIn();
    
    // Логика отправки формы
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formButton = form.querySelector('button[type="submit"]');
        const loadingMessage = document.getElementById('loading-message');
        const successMessage = document.getElementById('success-message');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        let hasError = false;
        if (!data.name.trim()) {
            document.getElementById('name-error').textContent = 'Обязательное поле';
            document.getElementById('name-error').classList.remove('hidden');
            hasError = true;
        } else {
            document.getElementById('name-error').classList.add('hidden');
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
            document.getElementById('email-error').textContent = 'Некорректный email';
            document.getElementById('email-error').classList.remove('hidden');
            hasError = true;
        } else {
            document.getElementById('email-error').classList.add('hidden');
        }

        if (hasError) return;

        formButton.disabled = true;
        loadingMessage.classList.remove('hidden');
        
        try {
            const userId = auth.currentUser?.uid || 'anonymous';
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            
            const submissionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'submissions');
            await addDoc(submissionsRef, {
                ...data,
                userId: userId,
                timestamp: serverTimestamp()
            });
            
            loadingMessage.classList.add('hidden');
            successMessage.classList.remove('hidden');
            formButton.disabled = false;
            form.reset();
            
        } catch (error) {
            console.error("Error writing document: ", error);
            loadingMessage.classList.add('hidden');
            formButton.disabled = false;
        }
    });

    // Логика аккордеона
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const sign = header.querySelector('span:last-child');
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                sign.textContent = '−';
            } else {
                content.classList.add('hidden');
                sign.textContent = '+';
            }
        });
    });
});
