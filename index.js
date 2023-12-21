import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db= new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"world",
    password:"password",
    port:5432
});
db.connect();
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// GET ROUTE
app.get("/", async (req, res) => {
  
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});


// POST ROUTE
app.post("/add",async(req,res)=>{
  
    const country=req.body.country;
  
    try{
      const table=await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [country.toLowerCase()]
    );

      
      // table.rows.forEach(code=>{
      //   country_code.push(code.country_code);
      // });
      const data = table.rows[0];
      console.log(data);
      const countryCode = data.country_code;
      try{
        // country_code.forEach(async code=>{
          await db.query(`INSERT INTO visited_countries(country_code) VALUES ($1)`,[countryCode]);
        //  })
         res.redirect('/');
      }catch(err){
        
      const countries = await checkVisisted();
        res.render("index.ejs", {
          countries: countries,
          total: countries.length,
          error: "Country has already been added, try again.",
        });
      }
      
    }catch(err){
    
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country name does not exist, try again.",
      });
    }
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
