import fs from 'fs'

export const slugify = (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâãèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

export const getLastSavedFile = () => {
    const path = './progression.json'
    const exists = fs.existsSync(path)
    if (!exists) return { chapter: 1, book: 1}

    const file = fs.readFileSync(path, 'utf8', (err) => {
        if (err) throw err
    })

    const { chapter = 1, book = 1 } = JSON.parse(file)
    return { chapter, book }
}

export const writeLastSavedFile = (chapter, book) => {
    const path = './progression.json'
    const saveObject = JSON.stringify({ chapter, book })
    try {
        fs.writeFileSync(path, saveObject, (err) => {
            console.log(saveObject)
            if (err) throw err;
        });
        console.log(`Last saved file:\nBook ${book} - Chapter ${chapter - 1}`);
    } catch(err) {
        console.error(err)
    }
}
