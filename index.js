
//Cria o canvas
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

//Conecta com o span de ID poin do HTML para poder atualizar os pontos
const pontuacao = document.querySelector('#pont')

//Define a largura e altura do canvas como toda a tela
canvas.width = window.innerWidth
canvas.height = window.innerHeight

//Inicia variaveis iniciais de número e velociade dos inimigos
var colunas = 8
var linhas = 4
var velocidadeGrid = 3
var carregado = true

//Carrega os audios do jogo, ajusta o volume e inicia a música
var musica = new Audio('./audio/music.mp3')
var gameOver = new Audio('./audio/game-over.mp3')
var limparOnda = new Audio('./audio/clear.mp3')
musica.volume = 0.2
gameOver.volume = 0.4
limparOnda.volume = 0.3
musica.loop = true
musica.play()

//Cria uma função para inicia várias instancias do mesmo aúdio de uma única vez (tiro do jogador)
const audioTiro = './audio/tiro.mp3';
function playTiro() {
    const audio = new Audio(audioTiro);
    audio.volume = 0.1
    audio.play()
}

//Cria uma função para inicia várias instancias do mesmo aúdio de uma única vez (explosão do inimigo)
const audioExpl = './audio/expl.mp3';
function playExpl() {
    const audio = new Audio(audioExpl);
    audio.volume = 0.2
    audio.play()
}

//Classe do Jogador
class Jogador {

    //Construtor da classe jogador
    constructor() {
        
        //Cria opacidade para poder sumir com o jogador na derrota
        this.opacidade = 1

        //Posição inicial (Duplicidade para evitar alguns erros no carregamento)
        this.posicao = {
            x: 500,
            y: 500
        }
        
        //Define a velociade inicial do jogador
        this.velocidade ={
            x: 0,
            y: 0
        }

        //Cria uma constate para a imagem do jogador e seleciona ela
        const imagemJ = new Image()
        imagemJ.src = './img/jogador.png'
        
        //Garante que a imagem esteja carregada antes de continuar
        imagemJ.onload = () => {
            this.image = imagemJ

            //Define a posição inicial do jogador
            this.posicao ={
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
        //Define largura e altura do jogador
        this.width = 75
        this.height = 75
    }

    //Desenha o jogador no canvas
    draw(){
        c.save()
        c.globalAlpha = this.opacidade
        c.drawImage(this.image, this.posicao.x, this.posicao.y, this.width, this.height)
        c.restore()
    }

    //Atualiza a posição do jogador 
    atualiza(){

        //Verifica se a imagem está carregada, chama a função draw e atualiza a posição do jogador
        if (this.image){
            this.draw()
            this.posicao.x += this.velocidade.x
        }
    }
}

//Classe do Inimigo
class Inimigo {
    
    //Construtor da classe INIMIGO
    constructor({posicao}) {
        
        //Posição inicial (Duplicidade para evitar alguns erros no carregamento)
        this.posicao = {
            x: posicao.x,
            y: posicao.y
        }
        
        //Define a velociade inicial do inimigo
        this.velocidade ={
            x: 0,
            y: 0
        }

        //Cria uma constate para a imagem do inimigo e seleciona ela
        const imagemJ = new Image()
        imagemJ.src = './img/inimigo.png'
        
        //Garante que a imagem esteja carregada antes de continuar
        imagemJ.onload = () => {
            this.image = imagemJ

            //Define a posição inicial do inimigo
            this.posicao = {
                x: posicao.x,
                y: posicao.y
            }
        }
        //Define largura e altura do inimigo
        this.width = 40
        this.height = 40
        
    }

    //Desenha o INIMIGO no canvas
    draw(){
        c.drawImage(this.image, this.posicao.x, this.posicao.y, this.width, this.height)      
    }

    //Atualiza a posição do inimigo
    atualiza({velocidade}){

        //Verifica se a imagem está carregada, chama a função draw eatualiza a posição
        if (this.image){
            this.draw()
            this.posicao.x += velocidade.x
            this.posicao.y += velocidade.y
        }
    }

    //Função que gera o tiro do inimigo na posição atual dele
    atira(inimigoTiros){
        inimigoTiros.push(
            new InimigoTiro({
                posicao: {
                    x: this.posicao.x + this.width / 2,
                    y: this.posicao.y + this.height
                },
                    velocidade: {
                    x: 0,
                    y: 5
                }
            })
        )
    }
    

}
    
//Classe para criar a grid com os inimigos
class Grid{
    constructor(){

        //Define a posição inicial
        this.posicao = {
            x: 0,
            y: 0
        }

        //Define a velocidade inicial de acordo com a variavel
        this.velocidade = {
            x: velocidadeGrid,
            y: 0
        }

        //Array de inimigos
        this.inimigos = []

        //Largura inicial de acordo com a quantidade de inimigos
        this.width = colunas * 43
        
        //Cria os inimigos e da espaçamento entre eles
        for (let i = 0; i < colunas; i++){
            for (let y = 0; y < linhas; y++){
                this.inimigos.push(new Inimigo({
                    posicao: {
                        x:i * 45,
                        y:y * 43
                    }
                }))
            }
        }
        
    }

    //Atualiza a posição dos inimigos
    atualiza(){
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
        this.velocidade.y = 0

        //Inverte a direção do movimento ao chegar no limite do canvas
        if (this.posicao.x + this.width >= canvas.width || this.posicao.x <= 0){
            this.velocidade.x = -this.velocidade.x
            this.velocidade.y = 30
        }
    }
}

//Classe das particulas para a explosão do inimigo e jogador
class Particula {
    constructor({posicao, velocidade, raio }) {
        this.posicao = posicao
        this.velocidade = velocidade
        this.raio = raio
        this.opacidade = 1
    }

    //Desenha as particulas como circulos e mantem controle da opacidade
    draw(){
        c.save()
        c.globalAlpha = this.opacidade
        c.beginPath()
        c.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI *2)
        c.fillStyle = '#7a0e06'
        c.fill()
        c.closePath()
        c.restore()
    }

    //Atualiza a posição das particulas na tela e diminui a opacidade
    atualiza(){
        this.draw()
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
        this.opacidade -= 0.01
    }
}

//Classe das paticilas de linhas na tela (A ideia era ser um mar, mas também funciona como espaço)
class ParticulaMar {
    constructor({posicao, velocidade, altura }) {
        this.posicao = posicao
        this.velocidade = velocidade
        this.opacidade = 0.5
        this.altura = altura
        this.width = 1
    }

    //Desenha as particulas como retângulos e mantem controle da opacidade
    draw(){
        c.save()
        c.globalAlpha = this.opacidade
        c.fillStyle = "white"
        c.fillRect(this.posicao.x, this.posicao.y, this.width, this.altura)
        c.restore()
    }

    //Atualiza a posição das particulas na tela
    atualiza(){
        this.draw()
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
    }
}

//Classe do tiro do jogador
class Tiro {
    constructor({posicao, velocidade }) {
        this.posicao = posicao
        this.velocidade = velocidade
        this.raio = 4
    }

    //Desenha o tiro do jogador como um círculo vermelho
    draw(){
        c.beginPath()
        c.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI *2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    //Atualiza a posição do tiro na tela
    atualiza(){
        this.draw()
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
    }
}

//Classe do tiro do inimigo
class InimigoTiro {
    constructor({posicao, velocidade }) {
        this.posicao = posicao
        this.velocidade = velocidade
        this.raio = 4
    }

    //Desenha o tiro do inimigo como um círculo branco
    draw(){
        c.beginPath()
        c.arc(this.posicao.x, this.posicao.y, this.raio, 0, Math.PI *2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

    //Atualiza a posição do tiro do inimigo na tela
    atualiza(){
        this.draw()
        this.posicao.x += this.velocidade.x
        this.posicao.y += this.velocidade.y
    }
}

//Cria um array para armazenar os tiros
const tiros = []

//Cria um novo objeto da classe jogador
const jogador = new Jogador()

//Cria um array de grids
const grids = [new Grid]

//Cria um array das particulas de explosão
const particulas = []

//Cria um array das particulas do Mar/Espaço
const particulasMar = []

//Controla se as teclas estão pressionadas
const teclas = {
    esq: {
        pressed: false
    },
    dir: {
        pressed: false
    },
    cim: {
        pressed: false
    }
}

//Cria um array dos tiros dos inimigos
const inimigoTiros = []

//Inicializa um contador de frames
let frames = 0

//Inicializa um contador da pontuação
let pontos = 0

//Controle se o jogo está em andamento (Diferença entre fim e ativo é para rodas os sons e animações quando o jogo encerra)
let jogo = {
    fim: false,
    ativo: true
}

//Cria as linhas no mar/espaço em pontos aleatórios da tela
for (let k = 0; k < 150; k++) {
    particulasMar.push(new ParticulaMar({
        posicao:{
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocidade:{
            x: 0,
            y: 2
        },
        //Define uma altura aleatória para as linhas
        altura: Math.random()*70
    }))
}

//Atualiza a tela
function atualizarTela(){
    //Impede a atualização no fim do jogo
    if (!jogo.ativo) return
    //Mantem a música tocando quando recarregado
    if (!jogo.fim)
    {
       musica.play()
    }
    requestAnimationFrame(atualizarTela)
    
    //Cor de fundo
    c.fillStyle = "blue"
    c.fillRect(0, 0, canvas.width, canvas.height)

    jogador.atualiza()

    //Faz com que as particulas voltem para o topo da tela quando sairem
    particulasMar.forEach((particulaMar) =>{
        if (particulaMar.posicao.y - particulaMar.altura >= canvas.height){
            particulaMar.posicao.x = Math.random() * canvas.width
            particulaMar.posicao.y = -particulaMar.altura
        }
        particulaMar.atualiza()
    })

    //Remove as particulas quando a opacidade chega a 0
    particulas.forEach((particula, index) =>{
        if (particula.opacidade <= 0){
            setTimeout(()=>{
                particulas.splice(index, 1)
            }) 
        }else{
            particula.atualiza()
        }
        })
    
    inimigoTiros.forEach((inimigoTiro, index)=>{
        //Remove o tiro do inimigo se sair do canvas
        if (inimigoTiro.posicao.y >= canvas.height){
            setTimeout(()=>{
                inimigoTiros.splice(index,1)
            },0)
        } else{
            inimigoTiro.atualiza()
        }
        
        //Verifica colisão do tiro inimigo com o jogador
        if(inimigoTiro.posicao.y + inimigoTiro.raio >= jogador.posicao.y &&
            inimigoTiro.posicao.x +inimigoTiro.raio>= jogador.posicao.x &&
            inimigoTiro.posicao.x <= jogador.posicao.x + jogador.width
        ) {
            //Caso jogador seja atingido reduz a opacidade do jogador para 0 e impede ações
            setTimeout(()=>{
                jogador.opacidade = 0
                jogo.fim = true
                inimigoTiros.splice(index,1)

                //Pausa a música e da play no som de fim de jogo
                musica.pause()
                gameOver.play()
            },0)

            //Depois de um momento para animação e áudio final para as atualizações
            setTimeout(()=>{
                jogo.ativo = false
            },2000)

            //Cria as particulas de explosão no jogador
            for (let k = 0; k < 150; k++) {
                particulas.push(new Particula({
                    posicao:{
                        x: jogador.posicao.x + jogador.width/2,
                        y: jogador.posicao.y + jogador.height/2
                    },
                    velocidade:{
                        x: (Math.random()-0.5) * 3,
                        y: (Math.random()-0.5) * 3
                    },
                    raio: Math.random()*4
                }))
            }
        } 
    })

    //Atualiza de todas as grids
    grids.forEach((grid, gridIndex) => {
        grid.atualiza()

        //Inimigo aleatorio atira a cada 100 frames
        if(frames % 100 === 0){
            grid.inimigos[Math.floor(Math.random()*grid.inimigos.length)].atira(inimigoTiros)
        }

        //Para cada inimigo da grid deixa a velocidade dele igual o da grid
        grid.inimigos.forEach((inimigo, i) =>{
            inimigo.atualiza({velocidade: grid.velocidade})

            //Destroi o inimigo e a bala caso tenha colisão
            tiros.forEach((tiro, j) =>{

                //Verifica se teve colisão do tiro com o inimigo
                if (tiro.posicao.y - tiro.raio <= inimigo.posicao.y + inimigo.height && 
                    tiro.posicao.x + tiro.raio >= inimigo.posicao.x && 
                    tiro.posicao.x - tiro.raio <= inimigo.posicao.x + inimigo.width &&
                    tiro.posicao.y+ tiro.raio >= inimigo.posicao.y){

                        //Confirma que apenas um tiro e inimigo serão usados
                        setTimeout(()=>{
                        const inimigoExiste = grid.inimigos.find(inimigoT => 
                            inimigoT === inimigo
                        )
                        const tiroExiste = tiros.find(tiroT => 
                            tiroT === tiro
                        )
                        
                        if (inimigoExiste && tiroExiste) {
                            //Incrementa e atualiza a pontuação
                            pontos +=50
                            pontuacao.innerHTML = pontos
                            playExpl()
                            //Cria particulas na morte do inimigo
                            for (let k = 0; k < 15; k++) {
                                particulas.push(new Particula({
                                    posicao:{
                                        x: inimigo.posicao.x + inimigo.width/2,
                                        y: inimigo.posicao.y + inimigo.height/2
                                    },
                                    velocidade:{
                                        x: (Math.random()-0.5) * 2,
                                        y: (Math.random()-0.5) * 2
                                    },
                                    raio: Math.random()*4
                                }))
                            }

                            //Remove o inimigo e o tiro 
                            grid.inimigos.splice(i,1)
                            tiros.splice(j,1)
                            
                            //Atualiza a largura da grid a medida que inimigos são derrotados
                            if (grid.inimigos.length > 0) {
                                const inimigoP = grid.inimigos[0]
                                const inimigoF = grid.inimigos[grid.inimigos.length - 1]

                                grid.width = inimigoF.posicao.x - inimigoP.posicao.x + inimigoF.width
                                grid.posicao.x = inimigoP.posicao.x 
                            } else {

                                //Cria uma nova grid de inimigos caso a grid atual esteja vazia
                                grids.splice(gridIndex, 1)
                                grids.push (new Grid)
                                
                                //Aumenta a pontuação e toca efeito sonoro por limpar onda
                                limparOnda.play()
                                pontos += 500
                                pontuacao.innerHTML = pontos

                                //Incrementa a quantidade de inimigos a medida que novas grids são criadas
                                colunas ++
                                if (colunas > linhas + 5){
                                    linhas ++
                                    colunas -= 1
                                }
                            }
                        }
                    },0)
                }
            })
        })

        
        
    })

    //Remove os tiros do jogador que sairam da tela
    tiros.forEach(tiro => {
        if (tiro.posicao.y + tiro.raio <= 0){
            tiros.splice(tiros.indexOf(tiro), 1)
        } else{
            tiro.atualiza()
        }      
    })

    //Move o jogador de acordo com a tecla pressionada, e garante que ele não escape do canvas
    if (teclas.esq.pressed && jogador.posicao.x >= 0) {
        jogador.velocidade.x = -5
    } else if (teclas.dir.pressed && jogador.posicao.x + jogador.width <= canvas.width) {
        jogador.velocidade.x = 5
    } else {
        jogador.velocidade.x = 0
    }

    //Incrementa a velocidade dos inimigos a medida que o tempo passa
    if (frames % 1000 === 0) {
        velocidadeGrid ++
    }

    //Incrementa o frame atual
    frames ++
}

//Chama a função de atualização da tela
atualizarTela()

//Associa as teclas aos comando, e controla quando são pressionadas
addEventListener("keydown", ({key}) =>{
    if (jogo.fim) return
    switch (key){
        case "ArrowUp":
        case "w":
        case " ":
            //Verifica se o tiro não está carregando / coloca em carregamento
            if (carregado){
                carregado = false

                //Toca o aúdio do tiro e dispara
                playTiro()
                tiros.push(new Tiro({
                posicao: {
                    //Seleciona a posição inicial do tiro como o meio da largura do jogador
                    x: jogador.posicao.x + jogador.width / 2,
                    y: jogador.posicao.y
                }, 
                velocidade: {
                    x:0,
                    y:-8
                }}))

                //Tempo de carregamento até um próximo tiro
                setTimeout(()=>{
                    carregado = true
                },150)
            }
            break
        case "ArrowLeft":
        case "a":
            teclas.esq.pressed = true
            break
        case "ArrowRight":
        case "d":
            teclas.dir.pressed = true
            break
    }
})

//Controla quando as teclas são soltas
addEventListener("keyup", ({key}) =>{
    switch (key){
        case "ArrowUp":
        case "w":
        case " ":
            console.log("Atirar")
            break
        case "ArrowLeft":
        case "a":
            teclas.esq.pressed = false
            break
        case "ArrowRight":
        case "d":
            teclas.dir.pressed = false
            break
    }
})