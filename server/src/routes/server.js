import express from "express"
const app =express();

app.get("/api/event", (req,res) => {
    res.status(200).send("Your event is on")
});  
app.listen(5001 ,() => {
    console.log("server started on port 5001")
})