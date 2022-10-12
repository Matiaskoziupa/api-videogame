require('dotenv').config();
const axios= require("axios");
const {Videogame, Genre}= require("../db")
const { Router } = require('express');
const { getAllGenres } = require('./controllers');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

const router = Router();



const URL = "https://api.rawg.io/api/games"


router.get("/videogames", async (req, res) => {
    let videogamesDb = await Videogame.findAll({
        include: Genre
    });
    //Parsear obj to json
    videogamesDb = JSON.stringify(videogamesDb);
    videogamesDb = JSON.parse(videogamesDb);
    //just gender.name
    videogamesDb = videogamesDb.reduce((acc, el) => acc.concat({
       
        ...el,
        genres: el.genres.map(s => s.name)
    }), [])

    if (req.query.name) {
        try {
            let name = req.query.name;
            let response = await axios.get(`${URL}?search=${name}&key=e145758c71a14c72bd4afd6699d4d322`);
            if (!response.data.count) return res.json({error:error.message})
           
            //count to count ;)
            response.data.results = response.data.results.reduce((acc, el) => acc.concat({
                // DB
                ...el,
                genres: el.genres.map(s => s.name)
            }), [])
            const filteredGamesDb = videogamesDb.filter(s => s.name.toLowerCase().includes(req.query.name.toLowerCase()));
            
            const results = [...filteredGamesDb, ...response.data.results.splice(0, 15)];
          
            return res.json(results)
        } catch (err) {
            return console.log(err)
        }
    } else {
        try {
            let pages = 0;
            let results = [...videogamesDb];// brigns state
            let response = await axios.get(`${URL}?key=e145758c71a14c72bd4afd6699d4d322`);
            //axios brings api data
            while (pages < 5) {
                pages++;
                response.data.results = response.data.results.reduce((acc, el) => acc.concat({
                    // data results y concatena
                    ...el,
                    genres: el.genres.map(s => s.name)
                }), [])
                results = [...results, ...response.data.results]//saving in results array
               
                response = await axios.get(response.data.next)
            }
            return res.json(results)
        } catch (err) {
            console.log(err)
            return res.sendStatus(500)
        }
    }
})



// GET /videogame/:idVideoGame
router.get("/videogame/:idVideogame", async (req, res) => {
const { idVideogame } = req.params
if (idVideogame.includes('-')) {
    let videogameDb = await Videogame.findOne({
        where: {
            id: idVideogame,
        },
        include: Genre
    })
    videogameDb = JSON.stringify(videogameDb);
    videogameDb = JSON.parse(videogameDb);
    videogameDb.genres = videogameDb.genres.map(s => s.name);
    res.json(videogameDb)
};

try {
    const response = await axios.get(`https://api.rawg.io/api/games/${idVideogame}?key=e145758c71a14c72bd4afd6699d4d322`);
    let { name, background_image, genres, description, released: releaseDate, rating, platforms }
     = response.data;
    genres = genres.map(s => s.name);
    platforms = platforms.map(p => p.platform.name);
    return res.json({
        name,
        background_image,
        genres,
        description,
        releaseDate,
        rating,
        platforms
    })
} catch (err) {
    return console.log(err)
}
})
// GET a /genres

router.get("/genres", async (req, res)=>{
    try{
        let genres= await getAllGenres();
        res.json(genres);
    } catch(err){
        res.send(err)
    }
})
//POST a /videogame

router.post("/videogame", async (req, res, next) => {

const {background_image, name, released, genres, rating, description, platforms} = req.body;
try{
    let newVideogame=await Videogame.create({
        name,
        description,
        background_image,
        released,
        rating,
        platforms,
    });
    let genreDb= await Genre.findAll({
        where: {
            name:
            genres
        },
    });
    newVideogame.addGenre(genreDb);
    res.send("Videogame created")
} catch(err){
    console.log(err)
}
})

// router.get("/platforms", async (req, res)=>{
//     const apiInfo= await axios.get("https://api.rawg.io/api/games?key=e145758c71a14c72bd4afd6699d4d322");
//         const apiData= apiInfo.data.results.map((s)=>{
//             const obj={    
//             platforms:s.platforms.map(s=>s.platform).map(s=>s.name),        
//         }   
//         return obj;
//         })
//         res.status(200).json(apiData)
// })


module.exports = router;
