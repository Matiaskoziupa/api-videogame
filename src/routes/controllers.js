require("dotenv").config();
const axios=require("axios");
const {Videogame, Genre}=require("../db")

const getAllGenres = async()=>{
    const genresApi= await axios.get("https://api.rawg.io/api/genres?key=e145758c71a14c72bd4afd6699d4d322");
    genresApi.data.results.map((s)=>{
        Genre.findOrCreate({
            where:{
                name:s.name,
            },
        });
    })
    const genresDb= await Genre.findAll();
    return genresDb
}

module.exports={
    getAllGenres
}