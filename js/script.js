"use-strict";
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry =>{
        if (entry.isIntersecting){
            entry.target.classList.add('animation');

            observer.unobserve(entry.target);
        }
    })
},{
    threshold: 0.1
});
window.addEventListener('DOMContentLoaded',()=>{

    const targetElements = document.querySelectorAll('.popup');
    targetElements.forEach(el =>{
        observer.observe(el);
    });
});