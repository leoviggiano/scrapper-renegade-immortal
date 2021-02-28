import fs from 'fs'
import puppeteer from 'puppeteer'
import { resolve } from 'path'

import { getLastSavedFile, writeLastSavedFile, slugify } from './utils';

const lastSavedFile = getLastSavedFile()

let currentBook = Number(lastSavedFile.book);
let currentChapter = Number(lastSavedFile.chapter);

process.on('exit', () => {
    writeLastSavedFile(currentChapter, currentBook)
});


const books = [71, 140, 200, 395, 471, 658, 920, 1140, 1478, 1553]
const scrape = async (url) => {
   const browser = await puppeteer.launch()
   const page = await browser.newPage()
   await page.goto(url)
   const result = await page.evaluate(() => {
       const items = []
       document.querySelectorAll('p').forEach(item => items.push(item.innerText))
       const length = items.length
       const removeIndexes = [0, 1, length - 1, length - 2, length - 3]
       return items.filter((_, index) => !removeIndexes.includes(index))
   })

   let [title] = await page.evaluate(() => {
       const items = []
       document.querySelectorAll('h2').forEach(item => items.push(item.innerText))
       return items
   })
   browser.close()

   const formattedTitle = title.split(':')[1].trim()
   return { novel: result, title: formattedTitle }
}

const scrapeAll = async () => {
    try {
        while(books.length >= currentBook && currentChapter <= books[books.length - 1]) {
            const url = `https://novelmania.com.br/novels/imortal-renegado/capitulos/livro-${currentBook}-capitulo-${currentChapter}`
            const { novel, title } = await scrape(url)

            const jsonContent = JSON.stringify({ novel, title });
            const path = resolve('files', `book-${currentBook}/${currentChapter}-${slugify(title)}.json`)
            const dir = `./files/book-${currentBook}`

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true })
            }

            fs.writeFile(path, jsonContent, 'utf8', (err) => {
                if (err) return console.log(err)
                console.log(`Progress: ${currentChapter - 1}/${books[books.length - 1]} - ${title}`)
            })

            currentChapter += 1
            if (currentChapter > books[currentBook - 1]) currentBook += 1
        }
    } catch(err) {
        console.error(err)
    }
    return currentChapter
}

scrapeAll().then((value) => {
    console.log(`${value} chapters saved with success`)
})