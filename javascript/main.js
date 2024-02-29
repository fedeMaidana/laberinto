import { canvas, btnUp, btnLeft, btnRight, btnDown, spanLives, spanTime, spanRecord, paragraphResult, btnReload } from './nexus.js'
import {emojis, maps} from './maps.js'

/**
    @type {HTMLCanvasElement}
*/

/* ------------------------------------------------------------- GLOBAL VARIABLES AND CONSTANTS ---------------------------------------------------- */

const GAME = canvas.getContext('2d')

const PLAYER_POSITION = {x: undefined, y: undefined}
const GIFT_POSITION = {x: undefined, y: undefined}

let canvasSize, elementsSize, enemyPositions = [], level = 0, lives = 3, timeStart, timePlayer, timeInterval

/* ------------------------------------------------------------------------ EVENTS ------------------------------------------------------------------ */

window.addEventListener('load', setCanvasSize)
window.addEventListener('resize', setCanvasSize)
window.addEventListener('keydown', moveByKeys)
btnUp.addEventListener('click', moveUp)
btnLeft.addEventListener('click', moveLeft)
btnRight.addEventListener('click', moveRight)
btnDown.addEventListener('click', moveDown)
btnReload.addEventListener('click', reload)

/* ---------------------------------------------------------------------- FUNCTIONS ----------------------------------------------------------------- */

function setCanvasSize(){
    window.innerHeight > window.innerWidth ? canvasSize = window.innerWidth * .7 : canvasSize = window.innerHeight * .7

    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)

    elementsSize = (canvasSize / 10) - 1

    PLAYER_POSITION.x = undefined
    PLAYER_POSITION.y = undefined

    startGame()
}

function startGame(){
    enemyPositions = []

    const MAP = maps[level].match(/[IXO\-]+/g).map(element => element.split(''))

    showLives()

    if(!timeStart){
        timeStart = Date.now()

        timeInterval = setInterval(showTime, 100)

        showRecord()
    }

    GAME.font = `${elementsSize}px Verdana`
    GAME.textAlign = 'start'
    GAME.clearRect(0, 0, canvasSize, canvasSize)

    MAP.forEach((row, rowIndex) => {
        row.forEach((column, columnIndex) => {
            const EMOJI = emojis[column]
            const POS_X = elementsSize * columnIndex
            const POS_Y = elementsSize * (rowIndex + 1)

            if(column == 'O'){
                if(!PLAYER_POSITION.x && !PLAYER_POSITION.y){
                    PLAYER_POSITION.x = POS_X
                    PLAYER_POSITION.y = POS_Y
                }
            }else if (column == 'I'){
                GIFT_POSITION.x = POS_X
                GIFT_POSITION.y = POS_Y
            }else if (column == 'X'){
                enemyPositions.push({x: POS_X, y: POS_Y})
            }

            GAME.fillText(EMOJI, POS_X, POS_Y)
        })
    })

    movePlayer()
}

function movePlayer(){
    const COLLISION_TOLERANCE = .1

    const GIFT_COLLISION_X = Math.abs(PLAYER_POSITION.x - GIFT_POSITION.x) < COLLISION_TOLERANCE
    const GIFT_COLLISION_Y = Math.abs(PLAYER_POSITION.y - GIFT_POSITION.y) < COLLISION_TOLERANCE

    if(GIFT_COLLISION_X && GIFT_COLLISION_Y) levelWin()

    const ENEMY_COLLISION = enemyPositions.find(enemy => {
        const ENEMY_COLLISION_X = Math.floor(enemy.x) === Math.floor(PLAYER_POSITION.x)
        const ENEMY_COLLISION_Y = Math.floor(enemy.y) === Math.floor(PLAYER_POSITION.y)

        return ENEMY_COLLISION_X && ENEMY_COLLISION_Y
    })

    if(ENEMY_COLLISION) levelFail()

    GAME.fillText(emojis['PLAYER'], PLAYER_POSITION.x, PLAYER_POSITION.y)
}

function levelWin(){
    level++

    if (level >= maps.length) {
        gameWin()

        return
    }

    startGame()
}

function levelFail(){
    lives--

    if(lives <= 0){
        level = 0
        lives = 3
        timeStart = undefined
    }

    PLAYER_POSITION.x = undefined
    PLAYER_POSITION.y = undefined

    startGame()
}

function gameWin(){
    console.log('Terminaste el juego. Felicidades!')

    clearInterval(timeInterval)

    const recordTime = localStorage.getItem('record_time')
    const playerTime = Date.now() - timeStart

    if(recordTime){
        if(recordTime >= playerTime){
            localStorage.setItem('record_time', playerTime)

            paragraphResult.innerText = 'Superaste el record, felicidades!!'
        }else{
            paragraphResult.innerText = 'No superaste el record'
        }
    }else{
        localStorage.setItem('record_time', playerTime)

        paragraphResult.innerText = 'Ese fue tu primer record ? \n Increible, ahora trata de superarlo'
    }
}

function showLives(){
    spanLives.innerText = emojis['HEART'].repeat(lives)
}

function formatTime(milliseconds){
    const seconds = parseInt(milliseconds / 1000) % 60
    const minutes = parseInt(milliseconds / 60_000) % 60
    const hours = parseInt(milliseconds / 3_600_000) % 24

    const secondsString = `0${seconds}`.slice(-2)
    const minutesString = `0${minutes}`.slice(-2)
    const hoursString = `0${hours}`.slice(-2)

    return `${hoursString}:${minutesString}:${secondsString}`
}

function showTime(){
    spanTime.innerText = formatTime(Date.now() - timeStart)
}

function showRecord(){
    spanRecord.innerText = localStorage.getItem('record_time')
}

function moveByKeys(event){
    if (event.key == 'ArrowUp') moveUp()
    else if (event.key == 'ArrowLeft') moveLeft()
    else if (event.key == 'ArrowRight') moveRight()
    else if (event.key == 'ArrowDown') moveDown()
}

function moveUp() {
    if (PLAYER_POSITION.y < elementsSize) console.log('OUT')
    else{
        PLAYER_POSITION.y -= elementsSize

        startGame()
    }
}

function moveLeft() {
    if (PLAYER_POSITION.x < (elementsSize / 2)) console.log('OUT')
    else{
        PLAYER_POSITION.x -= elementsSize

        startGame()
    }
}

function moveRight(){
    if ((PLAYER_POSITION.x + elementsSize) > (canvasSize - elementsSize)) console.log('OUT')
    else{
        PLAYER_POSITION.x += elementsSize

        startGame()
    }
}

function moveDown() {
    if ((PLAYER_POSITION.y + elementsSize) > canvasSize) console.log('OUT')
    else{
        PLAYER_POSITION.y += elementsSize

        startGame()
    }
}

function reload(){
    location.reload()
}