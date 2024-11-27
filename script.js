const scroller = scrollama();

scroller
    .setup({
        step: '.step',
        progress: true
    })
    .onStepEnter((response) => {
        const element = response.element;
        if (element.dataset !== undefined && element.dataset.section !== undefined)
        {
            const section = element.dataset.section;
            document.getElementById(section).classList.remove('inactive');
            document.getElementById(section).classList.add('active');
        }

        console.log(response);
    })
    .onStepExit((response) => {
        const element = response.element;
        if (element.dataset !== undefined && element.dataset.section !== undefined)
        {
            const section = element.dataset.section;
            document.getElementById(section).classList.remove('active');
            document.getElementById(section).classList.add('inactive');
        }
        
        console.log(response);
    })
    .onStepProgress((response) => {
        const element = response.element;

        if (element.dataset.type === "progressive")
        {
            if (element.id == "page-hero")
            {
                const heroContent = document.getElementById('hero-content');
               
                if (response.progress > 0.3) heroContent.classList.add('inactive'); else heroContent.classList.remove('inactive');
                document.querySelector('header#hero-section > #curtain').style.height = `${response.progress * 100}%`;
                document.getElementById('page-progress-bar').classList.add('hidden');
            }
            else
            {
                document.getElementById('page-progress-bar').classList.remove('hidden');
                document.querySelector('#page-progress-bar .progress-bar-fill').style.width = `${response.progress * 100}%`;
            }
           // console.log(response);
        }

    });

window.addEventListener('resize', scroller.resize);
window.scrollTo(0, 0);