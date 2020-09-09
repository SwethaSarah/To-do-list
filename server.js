const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const lodash=require("lodash");
const app=express();

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set("view engine","ejs");

app.listen(process.env.PORT,function(req,res){
    console.log("server listening");
});

mongoose.connect(process.env.MONGODB_ADDON_URI,{ useUnifiedTopology: true, useNewUrlParser: true });

const itemSchema={
    name: String
};

const Item= mongoose.model("Item",itemSchema);

const listSchema={
    name: String,
    content: [itemSchema]
};

const list= mongoose.model("list",listSchema); 

var foundlists=[];

app.get("/",function(req,res){
    list.find(function(err,foundlist){
        if(err){
            console.log(err);
        }
        else{
            for(i=0; i<foundlist.length; i++){
                foundlists[i]=foundlist[i];
            }
        }
    });

    Item.find(function(err,founditems){
        if(err){
            console.log(err);
        }
        else{
    res.render("todo",{listsarray: foundlists ,listName:"Priority", itemsarray: founditems});
        }
})
});

app.get("/:customList",function(req,res){
   list.find(function(err,foundlist){
        if(err){
            console.log(err);
        }
        else{
            for(i=0; i<foundlist.length; i++){
                foundlists[i]=foundlist[i];
            }
        }
    });
    if(req.url != '/favicon.ico'){
    const customList=lodash.capitalize(req.params.customList);
    if(customList!=="Priority"){
    list.findOne({name:customList},function(err,foundList){
       if(foundList!=null){
           res.render("todo",{listsarray: foundlists, listName: foundList.name, itemsarray:foundList.content});
       } 
       else{
           const newList = new list({
               name: customList,
           });
           newList.save();
           res.render("todo",{listsarray: foundlists, listName: newList.name, itemsarray: newList.content});
      } 
      })}
else{
    res.redirect("/");
}}});

app.post("/",function(req,res){
    list.find(function(err,foundlist){
        if(err){
            console.log(err);
        }
        else{
            for(i=0; i<foundlist.length; i++){
                foundlists[i]=foundlist[i];
            }
        }
    });
    const Title=req.body.List;
    item=req.body.newitem;
    const newitem=new Item({
        name: item
    });
    if (Title!=="Priority"){
    list.findOne({name: Title},function(err,found){
        found.content.push(newitem);
        found.save();
    })
    res.redirect("/"+Title);
   }
   else{
       newitem.save();
       res.redirect("/");
   }
});

app.post("/list",function(req,res){
    const Title=req.body.List;
       res.redirect("/"+Title);
});

app.post("/delete",function(req,res){
    const itemId= req.body.checkbox;
    const Title=req.body.Listname;
    if (Title!=="Priority"){
    list.findOneAndUpdate({name: Title},{$pull: { content: {_id: itemId}}},function(err){
        if(!err){
            console.log("Removed item from list");
        }
    });
    res.redirect("/"+Title);
   }else{
       Item.findByIdAndDelete(itemId,function(err){
           if(!err){
               console.log("Removed item from item");
           }
       })
       res.redirect("/");
   }
});
