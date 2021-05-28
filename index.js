const franc = require("franc");
const langs = require("langs");
const colors = require("colors");
const langForm = document.querySelector('#detect');
const container = document.querySelector('#language');

langForm.addEventListener('submit', function (e){
    e.preventDefault();
    const input = document.querySelector('input').value;
    const langCode = franc(input);
    if(langCode === 'und'){
        const newpara = document.createElement('P');
        newpara.innerText = 'Sorry unable to detect!!!';
        container.classList.add('red');
        container.append(newpara);
    }
    else{
        const language = langs.where("3", langCode);
        const newpara = document.createElement('P');
        newpara.append(`Our best guess is: ${language.name}`);
        container.classList.add('green');
        container.append(newpara);
    }
    
});

// const input = process.argv[2];
// console.log(input);
// const langCode = franc(input);
// const language = langs.where("3", langCode);
// console.log(language.name);