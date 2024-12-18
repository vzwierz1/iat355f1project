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

let data_F1Circuits;
let data_MostPopularSportsGlobal, data_MostPopularSportsGlobal_Filtered;
let data_ViewershipF1Nascar;

let geoWorld, geoCountries;
let carImageAnimIntervalId;
let popularityOfF1_CurrentStep = -1;
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
    document.querySelector('#section-f1-popularity__sports-comparison').classList.add('hidden');
    document.querySelector('#section-f1-popularity__racetrack-map-block').classList.add('hidden');
    document.querySelector('#section-f1-evolution .section-content').classList.add('hidden');
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
    document.getElementById('racetrack-map-textboxes__box_monaco').classList.remove('active');
    document.getElementById('racetrack-map-textboxes__box_monaco2').classList.remove('active');
    document.getElementById('racetrack-map-textboxes__box_suzuka').classList.remove('active');
    popularityOfF1_CurrentStep = -1;

    let plot, div;
    plot = getPlot_MostPopularSportsGlobal(1100, 360);
    div = document.querySelector("#section-f1-popularity__sports-comparison__chart-1");
    div.innerHTML = '';
    div.append(plot);

    plot = getPlot_MostPopularSportsGlobal_Filtered(1100, 360);
    div = document.querySelector("#section-f1-popularity__sports-comparison__chart-2");
    div.innerHTML = '';
    div.append(plot);

    plot = getPlot_MostPopularSportsGlobal_FilteredHighlighted(1100, 360);
    div = document.querySelector("#section-f1-popularity__sports-comparison__chart-3");
    div.innerHTML = '';
    div.append(plot);

    plot = getPlot_F1NascarComparison();
    div = document.querySelector("#section-f1-popularity__sports-comparison__chart-4");
    div.innerHTML = '';
    div.append(plot);

    plot = getPlot_F1NascarComparison_Delta();
    div = document.querySelector("#section-f1-popularity__sports-comparison__chart-5");
    div.innerHTML = '';
    div.append(plot);

    document.getElementById('grid-sports-comparison').classList.remove('grid-col-2');
    document.getElementById('grid-sports-comparison').classList.add('grid-row-2');
    document.getElementById('section-f1-popularity__sports-comparison__chart-1').classList.add('hidden');
    document.getElementById('section-f1-popularity__sports-comparison__chart-2').classList.add('hidden');
    document.getElementById('section-f1-popularity__sports-comparison__chart-3').classList.add('hidden');
    document.getElementById('section-f1-popularity__sports-comparison__chart-4').classList.add('hidden');
    document.getElementById('section-f1-popularity__sports-comparison__chart-5').classList.add('hidden');
}

function progressSection_PopularityOfF1(progress) {
    const numSteps = 9;
    const currentStep = Math.floor(progress * numSteps);
    let paragraphText;

    if (currentStep !== popularityOfF1_CurrentStep) {
        if (currentStep >= 0 && currentStep < 5) {
            document.querySelector('#section-f1-popularity__racetrack-map-block').classList.add('hidden');

            document.getElementById('grid-sports-comparison').classList.remove('grid-col-2');
            document.getElementById('grid-sports-comparison').classList.add('grid-row-2');
            document.querySelector('#section-f1-popularity__sports-comparison').classList.remove('hidden');
            document.getElementById('section-f1-popularity__sports-comparison__chart-1').classList.add('hidden');
            document.getElementById('section-f1-popularity__sports-comparison__chart-2').classList.add('hidden');
            document.getElementById('section-f1-popularity__sports-comparison__chart-3').classList.add('hidden');
            document.getElementById('section-f1-popularity__sports-comparison__chart-4').classList.add('hidden');
            document.getElementById('section-f1-popularity__sports-comparison__chart-5').classList.add('hidden');

            switch (currentStep) {
                case 0:
                    paragraphText = "In the world of sports, numbers speak volumes. While boxing, soccer, and cricket dominate viewership charts globally, Formula 1 is speeding its way into the conversation; especially in North America. Once considered a niche motorsport in the U.S. and Canada, F1’s popularity is accelerating faster than ever, largely fueled by Netflix’s Drive to Survive series and an increased focus on the North American market.";
                    document.getElementById('section-f1-popularity__sports-comparison__chart-1').classList.remove('hidden');
                    break;

                case 1:
                    paragraphText = "Focusing exclusively on sports with viewerships under 1 billion, Formula 1 emerges as a significant contender, attracting 500 million viewers worldwide. This places it ahead of American favorites such as basketball, which captures 400 million viewers, and American football, with 410 million fans. Yet, it trails behind volleyball and swimming, with massive followings of 900 million and 830 million respectively.";
                    document.getElementById('section-f1-popularity__sports-comparison__chart-2').classList.remove('hidden');
                    break;

                case 2:
                    paragraphText = "In fact, the amount of F1 and Grand Prix racing viewers is comparable to other popular sports like MMA, basketball and golf.";
                    document.getElementById('section-f1-popularity__sports-comparison__chart-3').classList.remove('hidden');
                    break;

                case 3:
                    paragraphText = "Even more so, if we focus on North America, over the last 7 years, F1 has steadily grown in popularity. Meanwhile, the historically beloved NASCAR racing, although still dominant in the region, has experienced a slight decline.";
                    document.getElementById('grid-sports-comparison').classList.add('grid-col-2');
                    document.getElementById('grid-sports-comparison').classList.remove('grid-row-2');
                    document.getElementById('section-f1-popularity__sports-comparison__chart-4').classList.remove('hidden');
                    break;

                case 4:
                    paragraphText = "We can see this trend more closely if we look only into the differences of viewership, between F1 and NASCAR, compared to the previous year.";
                    document.getElementById('grid-sports-comparison').classList.add('grid-col-2');
                    document.getElementById('grid-sports-comparison').classList.remove('grid-row-2');
                    document.getElementById('section-f1-popularity__sports-comparison__chart-5').classList.remove('hidden');
                    break;
            }

            document.querySelector('#sports-comparison-text p').innerText = paragraphText;
        }

        if (currentStep >= 5) {
            document.querySelector('#section-f1-popularity__racetrack-map-block').classList.remove('hidden');
            document.querySelector('#section-f1-popularity__sports-comparison').classList.add('hidden');

            document.getElementById('racetrack-map-textboxes__box_monaco').classList.remove('active');
            document.getElementById('racetrack-map-textboxes__box_monaco2').classList.remove('active');
            document.getElementById('racetrack-map-textboxes__box_suzuka').classList.remove('active');

            const plot = getPlot_RacetrackMap(800, 500);
            const div = document.querySelector("#racetrack-map");
            div.innerHTML = '';
            div.append(plot);

            switch (currentStep) {
                case 5:
                    paragraphText = "Formula 1 isn’t just about speed, it’s about the spectacle. The roar of engines, the thrill of split-second decisions, and the drama of navigating the world’s most dangerous circuits have all fueled its rise in popularity. But behind the glamour and global appeal lies a darker side: crashes that pushed both drivers and machines to their limits. These moments of danger didn’t just grab headlines; they became the catalyst for some of the most important innovations in the sport’s history.";
                    break;

                case 6:
                    paragraphText = "Monaco's Grand Prix circuit, with its narrow and twisting streets, has often been the backdrop for Formula 1's most thrilling and dangerous moments. Amid the tight turns and glitzy setting, tragic incidents have spurred major advances in safety and technology. One such incident took place at the Harbor Chicane, a notorious part of the track where the harsh realities of high-speed racing have become all too clear.";
                    document.getElementById('racetrack-map-textboxes__box_monaco').classList.add('active');
                    break;

                case 7:
                    document.getElementById('racetrack-map-textboxes__box_suzuka').classList.add('active');
                    paragraphText = "Suzuka Circuit, renowned for its famous corners, has consistently pushed the boundaries of Formula 1's safety standards. The complexity of the track layout necessitates precise run-off areas, crucial in mitigating the risks posed by high-speed racing. One fatal moment highlighting this necessity occurred during the Japanese Grand Prix, underscoring the ongoing evolution of safety measures within the sport.";
                    break;

                case 8:
                    document.getElementById('racetrack-map-textboxes__box_monaco2').classList.add('active');
                    paragraphText = "Monaco's Grand Prix circuit is famously tough. Its narrow streets and tight corners leave no room for mistakes, making it one of the most demanding tracks in Formula 1. Over the years, several serious crashes and tragic events have forced changes to make it safer. Despite these improvements, the track remains a huge challenge for drivers, combining the thrill of high-speed racing with the constant risk of accident.";
                    break;
            }

            document.querySelector('#racetrack-map-text p').innerText = paragraphText;
        }
    }

    popularityOfF1_CurrentStep = currentStep;
}

function renderSection_EvolutionOfF1() {
    document.getElementById('backdrop').classList.add('color-bg-dark-teal');
    document.getElementById('sidemenu').classList.add('color-bg-dark-teal');
    document.getElementById('evolution-of-cars-static').classList.remove('hidden');
    document.querySelector('#section-f1-evolution .section-content').classList.remove('hidden');
    evolutionOfF1_CurrentStep = -1;
    progressSection_EvolutionOfF1(0.0);

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

    if (currentStep !== evolutionOfF1_CurrentStep) {
        switch (currentStep) {
            case 0:
                eraText = "1950s-60s";
                carImgStartYear = 1950;
                carImgEndYear = 1969;
                evolutionOfCarsText = "The history of F1 cars is a story of constant innovation and a relentless drive for speed. When the Formula 1 World Championship began in 1950, cars were essentially modified road vehicles with front-mounted engines, wire wheels, and minimal safety features. Drivers relied heavily on skill to handle these simple machines.";
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
    d3.csv('data/22_most_popular_sports_globally.csv').then((data) => {
        data_MostPopularSportsGlobal = data;
        data_MostPopularSportsGlobal_Filtered = data_MostPopularSportsGlobal.filter(d => d['Estimated Viewers'] < 1000000000);
    });

    d3.csv('data/avg_viewership_2017-2023_f1-nascar.csv').then((data) => {
        data_ViewershipF1Nascar = data;
    });

    /* 
        load supplementary data
    */
    d3.csv('data/circuits.csv').then((data) => data_F1Circuits = data);

    Plot.dot(data_F1Circuits, { x: "lng", y: "lat", r: 5, fill: "currentColor", symbol: "dot" })
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
