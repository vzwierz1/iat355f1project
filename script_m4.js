const scroller = scrollama();
const progressBarHTML = '<div id="progress-bar"><div id="progress-bar-fill"></div></div>';

scroller
    .setup({
        step: '.step',
        offset: 1,
        progress: true
    })
    .onStepEnter((response) => {
        const element = response.element;
        const sidemenuId = element.dataset.sidemenuId;
        const headingText = element.dataset.headingText;

        (element.dataset.sidemenuHidden !== undefined && element.dataset.sidemenuHidden)
            ? document.getElementById('sidemenu').classList.add('hidden')
            : document.getElementById('sidemenu').classList.remove('hidden');

        (element.dataset.headingHidden !== undefined && element.dataset.headingHidden)
            ? document.getElementById('section-header').classList.add('hidden')
            : document.getElementById('section-header').classList.remove('hidden');

        if (sidemenuId !== undefined) {
            const sidemenuItem = document.getElementById(sidemenuId)
            sidemenuItem.classList.add('active');
            const innerDiv = sidemenuItem.getElementsByTagName('div')[0];
            innerDiv.innerHTML = progressBarHTML;
        }

        if (headingText !== undefined) {
            const headingElem = document.getElementById('section-header').getElementsByTagName('h1')[0];
            headingElem.innerText = headingText;
        }

        renderSections_Reset();
        switch (response.index) {
            case 0:
                renderSection_Hero();
                break;
            case 1:
                renderSection_HeroTransition();
                break;
            case 2:
                renderSection_Intro();
                break;
            case 3:
                renderSection_PopularityOfF1()
                break;
        }
        console.log(response);
    })
    .onStepExit((response) => {
        const element = response.element;
        const sidemenuId = element.dataset.sidemenuId;

        if (sidemenuId !== undefined) {
            const sidemenuItem = document.getElementById(sidemenuId)
            sidemenuItem.classList.remove('active');
            const innerDiv = sidemenuItem.getElementsByTagName('div')[0];
            innerDiv.innerHTML = "";
        }

        console.log(response);
    })
    .onStepProgress((response) => {
        const element = response.element;
        if (element.dataset === undefined || element.dataset.type !== "progressive") return;

        document.getElementById('progress-bar-fill').style.width = `${response.progress * 100}%`;
    });

window.addEventListener('resize', scroller.resize);
window.scrollTo(0, 0);

function renderSections_Reset() {
    document.getElementById('hero-static').classList.add('hidden');
    document.getElementById('intro-static').classList.add('hidden');
    document.getElementById('popularity-static').classList.add('hidden');
    document.getElementById('backdrop').classList.remove('collapsed');
}

function renderSection_Hero() {
    document.getElementById('hero-static').classList.remove('hidden');
    document.getElementById('backdrop').classList.add('collapsed');
}

function renderSection_HeroTransition() {
    document.getElementById('hero-static').classList.remove('hidden');
    document.getElementById('backdrop').classList.remove('collapsed');
}

function renderSection_Intro() {
    document.getElementById('intro-static').classList.remove('hidden');
}

function renderSection_PopularityOfF1() {
    document.getElementById('popularity-static').classList.remove('hidden');
}
