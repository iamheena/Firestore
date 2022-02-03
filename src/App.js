import React,{useState,useEffect} from 'react'
import db from './Firestore'
import { collection, addDoc,onSnapshot, QuerySnapshot, getDocs, query,doc,setDoc,deleteDoc, orderBy, limit,where, startAt, endAt, Query,startAfter , offset} from "firebase/firestore"; 
import style from './style.module.css'

function App() {
  const [Username, setUsername] = useState("")
  const [Passsword, setPassword] = useState("")
  const [Email, setEmail] = useState("") 
  const [info,setInfo]=useState([]); 
  const [Key,setkey]=useState(0); 
  const [dataLimit,setdataLimit]=useState(5);   
  const [lastvisible,setlastvisible]=useState(null)  
  const [page,setPage]=useState(1)
  const[totalval,setTotal]=useState(0)
  const[pageno,setpageNo]=useState([])

  const collectionque= collection(db,"User")   

  useEffect(async()=> {  
    handlePageChange(page)
   gettotal()
   
  },[])
  // console.log("outer page", page);
  const handlePageChange=async (pageNo)=>{
    // console.log("pagenooooooooo",pageNo);

    let skip = (pageNo-1)*dataLimit
    console.log("page", pageNo, skip);
      
      let startAfter1 = lastvisible
      console.log("lastVisible........",lastvisible);
      if(pageNo==1){
        startAfter1=null;
      }

    const q = query(collectionque,
      orderBy("Username","asc"),
      startAfter(startAfter1),
      limit(dataLimit)
    );    
    
    const documentsnap=await getDocs(q)   
    const lastvisible2=documentsnap.docs[documentsnap.docs.length-1]
    // setTotal(documentsnap)
    

    setlastvisible(lastvisible2)
    // console.log("length.....",lastvisible);
    // console.log("documentsnap", documentsnap);

    onSnapshot(q,(snapshot) =>{      
      let docData=[]
      // console.log("snapshot", snapshot.docs );
        snapshot.docs.map((doc) =>{
          // console.log("doccccccccccccccccc",doc);
          let info1=doc.data()
          info1.id=doc.id  
          docData.push(info1)  
          // console.log("info11111",info1);       
        })        
        setInfo (docData)
        setTotal(docData)
       
        // console.log("sdsdsdsdds",totalval);
      
      })
  }
  const gettotal= async()=>{
    const q = query(collectionque);    
    
    const totallength=  await getDocs(q) 
    console.log("totalitemmmmm",totallength.docs);

    const totalpage=Math.ceil(totallength.docs.length/dataLimit)
    console.log("totalpages",totalpage);
    setpageNo (totalpage)
  }
  
  const resetState=()=>{
    setUsername("")
    setPassword("")
    setEmail("")
  }  

  const submitdata= async ()=>
  {    
    const docRef = await addDoc(collection(db, "User"), {
      Username: Username,
      Passsword :Passsword,
      Email: Email
    });
    console.log("add data",docRef);
    resetState()
  }
  function editdata(id){
       info.find((d,key)=>{  
         if(d.id===id){
           console.log(key);           
           setUsername(d.Username)
           setPassword(d.Passsword)
           setEmail(d.Email)
           setkey(id)
        }  
    })  
  }  
  function updatedata(){
    const Username=document.querySelector("#uname").value
    const Passsword=document.querySelector("#pass").value
    const Email=document.querySelector("#email").value
    info.map((d,i)=>{
      if(d.id===Key){
        const itemRef = doc(db, "User", d.id);      
        setDoc(itemRef, {
          Username: Username,
          Passsword: Passsword,
          Email:Email
        })      

        resetState()
        setkey(null)
      }
    })
  }

  async function deletedata(id){    
    let request= await deleteDoc(doc(db,"User",id))
    console.log(request);
  }    

  const createPAgination =()=>{ 

    const ele=[]
    // console.log("sdshjdsdsdsddsds",pageno);

    for (let index = 1; index <= pageno; index++) {

        let pageUi= <button key={index} onClick={()=>{setPage(index);handlePageChange(index)}}>{index}</button>

      ele.push ( pageUi)      
    }
    return ele;
  }
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Email</th>
          </tr>
          {
          info.map((d,i)=>(    
          
              <tr key={d.id}>
              <td>{d.Username}</td>
              <td>{d.Passsword}</td>
              <td>{d.Email}</td>
              <td style={{width:"auto"}} onClick={()=>editdata(d.id)}><button>Edit</button></td>
              <td style={{width:"auto"}}><button onClick={()=>deletedata(d.id)}>Delete</button></td>
              
            </tr>            
          ))}         
        </tbody>
      </table>
    

{
  createPAgination()
}

      {/* <button onClick={()=>{ setPage(1); setlastvisible(null) ; handlePageChange(1)}}>1</button>
      <button onClick={()=>{ setPage(2); handlePageChange(2)}}>2</button>
      <button onClick={()=>{ setPage(3); handlePageChange(3)}}>3</button> */}
      
      <div className={style.content}>
        <label htmlFor="">Username</label>
              <input type="text" id="uname" value={Username} onChange={(e)=>setUsername(e.target.value)}/>
        <label htmlFor="">Password</label>
              <input type="text"  id="pass" value ={Passsword} onChange={(e)=>setPassword(e.target.value)}/>
         <label htmlFor="">Email</label>
              <input type="text"  id="email" value={Email} onChange={(e)=>setEmail(e.target.value)}/>
              {Key?
                <button onClick={updatedata}>Update</button>:
              <button onClick={submitdata}>Submit</button>
                }
            
      </div>
      
    </div>
  )
}

//https://www.geeksforgeeks.org/how-to-use-firestore-database-in-reactjs/

export default App
