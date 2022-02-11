import React, { useState, useEffect } from "react";
import db from "./Firestore";
import {
  collection,
  addDoc,
  onSnapshot,
  QuerySnapshot,
  getDocs,
  query,
  doc,
  setDoc,
  deleteDoc,
  orderBy,
  limit,
  where,
  startAt,
  endAt,
  Query,
  startAfter,
  offset,
  endBefore,
} from "firebase/firestore";
import style from "./style.module.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import ProgressBar from "react-bootstrap/ProgressBar";

function App() {
  const [Username, setUsername] = useState("");
  const [Passsword, setPassword] = useState("");
  const [Email, setEmail] = useState("");
  const [Image, setImage] = useState([]);
  const [info, setInfo] = useState([]);
  const [Key, setkey] = useState(0);
  const [dataLimit, setdataLimit] = useState(5);
  const [lastvisible, setlastvisible] = useState(null);
  const[filterItemData,setFilterItemData]=useState([]);

  const [page, setPage] = useState(1);
  const [totalval, setTotal] = useState(0);
  const [pageno, setpageNo] = useState([]);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState([]);
  

  const collectionque = collection(db, "Users");

  const storage = getStorage();
  useEffect(
     () => {
      handlePageChange(page);
      gettotal();    
      
    },   
    [Image,url]
  );
 
  const handlePageChange = async (pageNo) => {
    console.log("pagenooooo",pageNo);
    let skip = (pageNo - 1) * dataLimit;
    console.log("page skip",pageNo,skip);

    let startafter1=lastvisible  
    if(pageNo===1){
       startafter1=null
       const first = query(
        collectionque,
        orderBy("Username", "asc"),
        startAfter(startafter1),
        limit(dataLimit)
      );
      const documentSnapshots = await getDocs(first);
      console.log("pageno 1",documentSnapshots.docs);

      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
      console.log("last", lastVisible);
      setlastvisible(lastVisible);
      onSnapshot(first, (snapshot) => {
        let docData = [];
        snapshot.docs.map((doc) => {
          let info1 = doc.data();
          info1.id = doc.id;
          docData.push(info1);
          return info1;
        });
        setInfo(docData);
        setFilterItemData(docData);
      });
    }
    else if(pageno ===2){
      const collectionque = collection(db, "Users");
      // console.log("collection",collectionque);

      const documentSnapshots = await getDocs(collectionque);   
      
      console.log("lastvisible",lastvisible);
      const first = query(
        collectionque,
        orderBy("Username", "asc"),
        startAfter(lastvisible),
        limit(dataLimit)
      );
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
      // console.log("last", lastVisible);
      setlastvisible(lastVisible);
      onSnapshot(first, (snapshot) => {
        let docData = [];
        snapshot.docs.map((doc) => {
          let info1 = doc.data();
          info1.id = doc.id;
          docData.push(info1);
          return info1;
        });
        setInfo(docData);
        setFilterItemData(docData);
      });
    }    
    if(pageNo===3){

    } 
  };
  const gettotal = async () => {
    const q = query(collectionque);

    const totallength = await getDocs(q);
    // console.log("totalitemmmmm", totallength.docs);

    const totalpage = Math.ceil(totallength.docs.length / dataLimit);
    // console.log("totalpages", totalpage);
    setpageNo(totalpage);
  };

  const resetState = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setImage("");
  };

  const submitdata = async () => {
    console.log("submit image", Image);
    const docRef = await addDoc(collection(db, "Users"), {
      Username: Username,
      Passsword: Passsword,
      Email: Email,
      Image: Image,
    });
    console.log("add data", docRef);
    resetState();
  };

  function editdata(id) {
   info.find((d, key) => {
      if (d.id === id) {
        console.log(key);
        setUsername(d.Username);
        setPassword(d.Passsword);
        setEmail(d.Email);
        setImage(d.Image);
        setkey(id);
       
      }
      return d
    });
  }
  function updatedata() {
    const Username = document.querySelector("#uname").value;
    const Passsword = document.querySelector("#pass").value;
    const Email = document.querySelector("#email").value;
    const Image = document.querySelector("#image").filename;
    info.map((d, i) => {
      if (d.id === Key) {
        const itemRef = doc(db, "Users", d.id);
        setDoc(itemRef, {
          Username: Username,
          Passsword: Passsword,
          Email: Email,
          Image: Image,
        });       

        resetState();
        setkey(null);
      }
    });
  }

  async function deletedata(id) {
    let request = await deleteDoc(doc(db, "Users", id));
    console.log(request);
  }

  const createPAgination = () => {
    const ele = [];
    for (let index = 1; index <= pageno; index++) {
      let pageUi = (
        <button
          key={index}
          onClick={() => {
            setPage(index);
            handlePageChange(index);
          }}
        >
          {index}
         
        </button>
      );

      ele.push(pageUi);
    }
    return ele;
  };
  const handlechange = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const newImage = e.target.files[i];
      newImage["Id"] = Math.random();
      setImage((prevState) => [...prevState, newImage]);
    }
  };
  const uploadfile = () => {
    const promise = [];
    Image.map((image) => {
      if (image == null) return;
      const storageRef = ref(storage, `/images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      promise.push(storageRef.name);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(prog);
        },
        (err) => console.log(err),
        async () => {
          await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setUrl((preState) => [...preState, url]);
          });
        }
      );
    });
    setImage(promise);
    // Promise.all(promise)
    // .then(()=>console.log("all image upload"))
    // .catch((err)=>console.log(err))
  };
  const handlesearch= (e)=>{
     const searchdata=e.target.value

  //  setFilter(searchdata)
  const data= info.filter((item)=>{   
    
       if(searchdata=="" ){      
         return item
       } 
       else if(item.Username && item.Username.toLowerCase().includes(searchdata)){
        return item
      }      
     
   }) 
  //  console.log("dataaattaaa",data);
  //  console.log("info",info);
   setFilterItemData(data)
   
  } 
  return (
    <div>
        <div className="search" >
              <input type="text" onChange={handlesearch} placeholder="Search...."  />
              <button >Search</button>
              
      </div>
      <table>
        <tbody>
          <tr>
            <th>Username</th>
            <th>Password</th>
            <th>Email</th>
            <th>Image</th>
          </tr>
         {filterItemData.map((d, i) => (
            <tr key={d.id}>
              <td>{d.Username}</td>
              <td>{d.Passsword}</td>
              <td>{d.Email}</td>
              <td>{d.Image}</td>
              <td style={{ width: "auto" }} onClick={() => editdata(d.id)}>
                <button>Edit</button>
              </td>
              <td style={{ width: "auto" }}>
                <button onClick={() => deletedata(d.id)}>Delete</button>
              </td>
            </tr>
          ))
            }
            
            
        </tbody>
      </table>

      {createPAgination()}

      <div className={style.content}>
        <label htmlFor="">Username</label>
        <input
          type="text"
          id="uname"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="">Password</label>
        <input
          type="password"
          id="pass"
          value={Passsword}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="">Email</label>
        <input
          type="text"
          id="email"
          value={Email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="">Image</label>
        <input
          type="file"
          name="file"
          multiple
          accept="image/*,application/*,video/*"
          id="image"
          filename={Image}
          onChange={handlechange}
        />
        {/* <h3>Upload {progress}%</h3> */}
        Upload{" "}
        {progress && (
          <ProgressBar
            now={progress}
            label={`${progress}%`}
            style={{ width: "100%" }}
          />
        )}
        <button onClick={uploadfile}>Upload</button>
        {Key ? (
          <button onClick={updatedata}>Update</button>
        ) : (
          <button onClick={submitdata}>Submit</button>
        )}
      </div>
    </div>
  );
}

export default App;
