const scroller = scrollama();
const progressBarHTML = '<div id="progress-bar"><div id="progress-bar-fill"></div></div>';

const sections = {
    HERO: 0,
    HERO_TRANSITION: 1,
    INTRO: 2,
    POPULARITY_OF_F1: 3,
    EVOLUTION_OF_CARS: 4,
}

const carImageAnimFrameLen = 1000;  // ms

let f1Circuits;
let geoWorld, geoCountries;
let carImageAnimIntervalId;
let evolutionOfF1_CurrentStep = -1;

loadData();
bindExtraEvents();

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
                renderSection_PopularityOfF1();
                break;
            case sections.EVOLUTION_OF_CARS:
                renderSection_EvolutionOfF1();
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

            case sections.EVOLUTION_OF_CARS:
                progressSection_EvolutionOfF1(response.progress);
                break;
        }
    });

window.addEventListener('resize', scroller.resize);
window.scrollTo(0, 0);

function renderSections_Reset() {
    document.getElementById('hero-static').classList.add('hidden');
    document.getElementById('intro-static').classList.add('hidden');
    document.getElementById('popularity-static').classList.add('hidden');
    document.getElementById('evolution-of-cars-static').classList.add('hidden');

    document.getElementById('backdrop').classList.remove('collapsed');
    document.getElementById('backdrop').classList.remove('color-bg-dark-teal');
    document.getElementById('sidemenu').classList.remove('color-bg-dark-teal');

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
    const numSteps = 4;
    const currentStep = Math.floor(progress * numSteps);
    let racetrackMapText;

    document.getElementById('racetrack-map-textboxes__box_monaco').classList.remove('active');
    document.getElementById('racetrack-map-textboxes__box_suzuka').classList.remove('active');

    switch (currentStep) {
        case 0:
            racetrackMapText = "Formula 1 isn’t just about speed, it’s about the spectacle. The roar of engines, the thrill of split-second decisions, and the drama of navigating the world’s most dangerous circuits have all fueled its rise in popularity. But behind the glamour and global appeal lies a darker side: crashes that pushed both drivers and machines to their limits. These moments of danger didn’t just grab headlines; they became the catalyst for some of the most important innovations in the sport’s history.";
            break;
        case 1:
            racetrackMapText = "Monaco's Grand Prix circuit, with its narrow and twisting streets, has often been the backdrop for Formula 1's most thrilling and dangerous moments. Amid the tight turns and glitzy setting, tragic incidents have spurred major advances in safety and technology. One such incident took place at the Harbor Chicane, a notorious part of the track where the harsh realities of high-speed racing have become all too clear.";
            document.getElementById('racetrack-map-textboxes__box_monaco').classList.add('active');
            break;
        case 2:
            document.getElementById('racetrack-map-textboxes__box_suzuka').classList.add('active');
            racetrackMapText = "Suzuka Circuit, renowned for its famous corners, has consistently pushed the boundaries of Formula 1's safety standards. The complexity of the track layout necessitates precise run-off areas, crucial in mitigating the risks posed by high-speed racing. One fatal moment highlighting this necessity occurred during the Japanese Grand Prix, underscoring the ongoing evolution of safety measures within the sport.";
            break;
        case 3:
            document.getElementById('racetrack-map-textboxes__box_monaco2').classList.add('active');
            racetrackMapText = "Monaco's Grand Prix circuit is famously tough. Its narrow streets and tight corners leave no room for mistakes, making it one of the most demanding tracks in Formula 1. Over the years, several serious crashes and tragic events have forced changes to make it safer. Despite these improvements, the track remains a huge challenge for drivers, combining the thrill of high-speed racing with the constant risk of accident.";
            break;
    }

    document.querySelector('#racetrack-map-text p').innerText = racetrackMapText;
}

function renderSection_EvolutionOfF1() {
    document.getElementById('backdrop').classList.add('color-bg-dark-teal');
    document.getElementById('sidemenu').classList.add('color-bg-dark-teal');
    document.getElementById('evolution-of-cars-static').classList.remove('hidden');
    document.getElementById('section-f1-evolution__cars__compare-checkbox').checked = false;
    document.getElementById('section-f1-evolution__cars__car-graphic__overlay-image').classList.add('hidden');
    document.getElementById('section-f1-evolution__cars__compare-slider').dispatchEvent(new Event('input'));
}

function progressSection_EvolutionOfF1(progress) {
    const numSteps = 4;
    const currentStep = Math.floor(progress * numSteps);
    let eraText;
    let evolutionOfCarsText;
    let carImgStartYear, carImgEndYear;

    if (currentStep !== evolutionOfF1_CurrentStep)
    {
        switch (currentStep) {
            case 0:
                eraText = "1950s-60s";
                carImgStartYear = 1950;
                carImgEndYear = 1969;
                evolutionOfCarsText = "The history of F1 cars is a story of constant innovation and a relentless drive for speed. When the Formula 1 World Championship began in 1950, cars were essentially modified road vehicles with front-mounted engines, wire wheels, and minimal safety features. Drivers relied heavily on skill to handle these simple machines.";
              //  EvolutionOfF1_startCarAnimation();
                console.log('evolution of f1 prgoress');
                
                break;
            case 1:
                eraText = "1970s-80s";
                carImgStartYear = 1970;
                carImgEndYear = 1989;
                evolutionOfCarsText = "In the 1960s, F1 underwent a major shift with rear-mounted engines, pioneered by teams like Cooper, improving handling and setting a standard still used today. The 1970s introduced wings and spoilers, revolutionizing aerodynamics and boosting cornering speed. By the 1980s, turbocharged engines dominated, delivering over 1,000 horsepower and creating an era of raw power.";
                break;
            case 2:
                eraText = "1990s-2000s";
                carImgStartYear = 1990;
                carImgEndYear = 2009;
                evolutionOfCarsText = "The 1990s and 2000s brought advanced aerodynamics and electronic aids like traction control and semi-automatic gearboxes, making cars faster and more efficient. Safety became a top priority with features like crash structures, improved helmets, and the HANS device.";
                break;
            case 3:
                eraText = "2010s-now";
                carImgStartYear = 2010;
                carImgEndYear = 2022;
                evolutionOfCarsText = "Today’s F1 cars are engineering marvels, combining hybrid power units with complex aerodynamics for incredible speed and efficiency. Innovations like the halo device have also made the sport much safer. From the raw machines of the 1950s to today’s highly sophisticated cars, F1’s evolution reflects its ongoing pursuit of performance and innovation, making it one of the most thrilling sports in the world.";
                break;
        }

        document.getElementById('section-f1-evolution__cars__sub-heading').innerText = eraText;
        document.querySelector('#section-f1-evolution__cars__text p').innerText = evolutionOfCarsText;
    
        const slider = document.getElementById('section-f1-evolution__cars__car-graphic__year-slider');
        slider.setAttribute('min', carImgStartYear);
        slider.setAttribute('max', carImgEndYear);
        slider.value = carImgStartYear;
        slider.dispatchEvent(new Event('input'));
        EvolutionOfF1_startCarAnimation();

        document.getElementById('section-f1-evolution__cars__car-graphic__overlay-image').setAttribute('src', `i/cars/1960.jpg`);

    }

    evolutionOfF1_CurrentStep = currentStep;
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

function bindExtraEvents() {
    document.getElementById('section-f1-evolution__cars__car-graphic__year-slider').addEventListener("input", EvolutionOfF1_onCarYearSliderValueChanged);
    document.getElementById('section-f1-evolution__cars__car-graphic__year-slider').addEventListener("click", (event) => {
        console.log('slider click');
        
        if (carImageAnimIntervalId) clearInterval(carImageAnimIntervalId);
    });

    document.getElementById('section-f1-evolution__cars__compare-checkbox').addEventListener("change", EvolutionOfF1_onCompareCheckboxChange);
    document.getElementById('section-f1-evolution__cars__compare-slider').addEventListener("input", EvolutionOfF1_onCarCompareSliderValueChanged);
}

function EvolutionOfF1_onCarYearSliderValueChanged(event) {
    const year = event.target.value;

    document.getElementById('section-f1-evolution__cars__car-graphic__year-slider__label').textContent = year;
    document.getElementById('section-f1-evolution__cars__car-graphic__image').setAttribute('src', `i/cars/${year}.jpg`);    
}

function EvolutionOfF1_onCarCompareSliderValueChanged(event) {
    const year = event.target.value;

    document.getElementById('section-f1-evolution__cars__compare-slider__label').textContent = year;
    document.getElementById('section-f1-evolution__cars__car-graphic__overlay-image').setAttribute('src', `i/cars/${year}.jpg`);    
}

function EvolutionOfF1_startCarAnimation() {
    if (carImageAnimIntervalId) clearInterval(carImageAnimIntervalId);

    carImageAnimIntervalId = setInterval(() => {
        const slider = document.getElementById('section-f1-evolution__cars__car-graphic__year-slider');
        const sliderMin = slider.getAttribute('min');
        const sliderMax = slider.getAttribute('max');

        if (slider.value < sliderMax) slider.value++;
        else slider.value = sliderMin;

        slider.dispatchEvent(new Event('input'));
    
    }, carImageAnimFrameLen);
}

function EvolutionOfF1_onCompareCheckboxChange(event) {
    if (event.target.checked) {
        document.getElementById('section-f1-evolution__cars__car-graphic__overlay-image').classList.remove('hidden');
    }
    else {
        document.getElementById('section-f1-evolution__cars__car-graphic__overlay-image').classList.add('hidden');
    }
}
