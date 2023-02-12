const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


let workItems=[];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect("mongodb+srv://admin-prashun:Test123@cluster0.iss0jy6.mongodb.net/todolistDB",{useNewUrlParser: true,useUnifiedTopology:true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name:"Hit the + button to aff a new item."
});
const item3 = new Item({
    name:"<-- Hit this to delete an item."
})

const defaultItems = [item1,item2,item3];
const listSchema = {
    name:String,
    items: [itemSchema]
};
const List = mongoose.model("List",listSchema);



app.get("/", function (req, res) {

    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("successfully add to the DB.");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list", { listTitle: "Today" , newListItem:foundItems});
        } 
    });
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err,foundlist){
        if(!err){
            if(!foundlist){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list",{ listTitle: foundlist.name , newListItem:foundlist.items});
            }
        }
    })

    

});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundlist){
            foundlist.items.push(item);
            foundlist.save();
            res.redirect("/"+listName);
        });
    }
   
});

app.post("/delete",function(req,res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemID,function(err){
            if(!err){
                console.log("Successfully deleted checked item.");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID }}},function(err,foundlist){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
})
app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List",newListItem: workItems});
});
app.post("/work",function(req,res){
    
    let item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})
app.get("/about",function(req,res){
    res.render("about");
});

app.listen(3000, function () {
    console.log("server started on port 3000");
});