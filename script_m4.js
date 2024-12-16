const scroller = scrollama();
const progressBarHTML = '<div id="progress-bar"><div id="progress-bar-fill"></div></div>';
const sections = {
    HERO: 0,
    HERO_TRANSITION: 1,
    INTRO: 2,
    POPULARITY_OF_F1: 3
}

let f1Circuits;
let geoWorld, geoCountries;
loadData();

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
            case sections.HERO:
                renderSection_Hero();
                break;
            case sections.HERO_TRANSITION:
                renderSection_HeroTransition();
                break;
            case sections.INTRO:
                renderSection_Intro();
                break;
            case sections.POPULARITY_OF_F1:
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

        switch (response.index) {
            case sections.POPULARITY_OF_F1:
                progressSection_PopularityOfF1(response.progress);
                break;
        }
    });

window.addEventListener('resize', scroller.resize);
window.scrollTo(0, 0);

function renderSections_Reset() {
    document.getElementById('hero-static').classList.add('hidden');
    document.getElementById('intro-static').classList.add('hidden');
    document.getElementById('popularity-static').classList.add('hidden');
    document.getElementById('backdrop').classList.remove('collapsed');

    document.querySelector('#section-intro .section-content').classList.add('hidden');
    document.querySelector('#section-f1-popularity .section-content').classList.add('hidden');
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
    document.querySelector('#section-intro .section-content').classList.remove('hidden');
}

function renderSection_PopularityOfF1() {
    document.getElementById('popularity-static').classList.remove('hidden');
    document.querySelector('#section-f1-popularity .section-content').classList.remove('hidden');

    const plot = Plot.plot({
        width: 800,
        height: 500,
        style: "color: #000",
        projection: ({ width, height }) => d3.geoMercator()
            .translate([width / 2 + 10, height / 2 + 70])
            .scale(135),
        marks: [
            Plot.graticule({ stroke: "#808080", strokeOpacity: 0.25 }),
            Plot.geo(geoCountries, { fill: '#7E7E7E', stroke: "#606060", strokeOpacity: 0.5 }),
            Plot.dot(f1Circuits, { x: "lng", y: "lat", r: 3, fill: "#ff4b33", symbol: "dot", tip: true, title: (datum) => `${datum.name}\n\nLocation: ${datum.location}\nCountry: ${datum.country}` }),
            Plot.sphere({ stroke: "#000", strokeOpacity: 0 })
        ]
    })

    const div = document.querySelector("#racetrack-map");
    div.innerHTML = '';
    div.append(plot);
}

function progressSection_PopularityOfF1(progress) {
    console.log('progress: ' + progress);
    const numSteps = 4;
    const currentStep = Math.floor(progress * numSteps);
    let racetrackMapText;

    document.getElementById('racetrack-map-textboxes__box_monaco').classList.remove('active');
    document.getElementById('racetrack-map-textboxes__box_suzuka').classList.remove('active');

    switch (currentStep) {
        case 0:
            racetrackMapText = "Take a look at the world of Formula 1 with this map of track locations around the globe. From the glamorous streets of Monaco to Japan's Suzuka Circuit, these tracks show just how far F1’s excitement and passion reach, bringing fans together no matter where they are.";
            break;
        case 1:
            racetrackMapText = "Monaco’s narrow streets? They pushed engineers to come up with better crash barriers.";
            document.getElementById('racetrack-map-textboxes__box_monaco').classList.add('active');
            break;
        case 2:
            document.getElementById('racetrack-map-textboxes__box_suzuka').classList.add('active');
            racetrackMapText = "Suzuka’s famous corners? They taught F1 how to design run-off areas.";
            break;
        case 3:
            document.getElementById('racetrack-map-textboxes__box_monaco').classList.add('active');
            racetrackMapText = "Monaco’s so tight that even modern cars barely fit!";
            break;
    }

    document.querySelector('#racetrack-map-text p').innerText = racetrackMapText;
}

async function loadData() {
    /* 
        load F1 data
    */
    d3.csv('data/circuits.csv').then((data) => f1Circuits = data);

    Plot.dot(f1Circuits, { x: "lng", y: "lat", r: 5, fill: "currentColor", symbol: "dot" })
    /* 
        prepare the racetrack map
    */
    const requestURL = "data/geo/countries-110m.json";
    const request = new Request(requestURL);
    const response = await fetch(request);
    const world = await response.json();
    geoWorld = world;
    geoCountries = topojson.feature(world, world.objects.countries);
}
