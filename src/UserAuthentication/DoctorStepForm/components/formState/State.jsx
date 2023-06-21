import React, { createContext,useContext, useState } from "react";
import axios from "axios";
import {AuthContext} from "../../../../Store/UserState"


export const FormContext = createContext();

const FormContextProvider = (props) => {
  const formArray = [1, 2, 3, 4];
  const [formNo, setFormNo] = useState(formArray[0]);
  const {isAuth,getStoredCookie} = useContext(AuthContext)

  const next = () => {
    setFormNo(formNo + 1);
  };

  const prev = () => {
    setFormNo(formNo - 1);
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [Userinformation, setUserInformation] = useState({
    DOB: "",
    bloodGroup: "A+",

    imageUrl: "",

    height: "",
    Age: "0",
    weight: "",
    gender: "",

    NMCno : "",
    speciality : "",
    experience : "",
    qualification : "",

    selectedFile: selectedFile,
    citizenshipno: "21-123",
    phonenumber: "23432",


    error: false,
    message: '',
    loading: false,
    hospitalName : [],
    location: {
      Locationid: "",
      prov: "",
      district: "",
      municipality: "",
      Address: "",
    },
  });

  const AddHospital = (name,id) => {

         const uniqueHospital = !Userinformation.hospitalName.some(
            (object) => object.id === id
         )

         if(uniqueHospital){
             setUserInformation((prevState) => {
                  return {...prevState,hospitalName:[...prevState.hospitalName,{name:name,id:id}]}
             })
         }
  }

  const RemoveHospital = (id) => {
    const UpdatedObject = Userinformation.hospitalName.filter((object) => object.id !== id)
    setUserInformation((prevState) => {
       return {...prevState,hospitalName : UpdatedObject}
    })
  }


  const PostData = () => {
    let HospitalId = []
    Userinformation.hospitalName.map((ele) => HospitalId.push(ele.id));
    
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}api/doctor/save`,
      headers: {
        'Authorization': `Bearer ${getStoredCookie("token")}`,
      },
      data: {
          userId : isAuth().userId,
          citizenshipNo: Userinformation.citizenshipValue,
          phoneNumber: Userinformation.phonenumber,
          weight: Userinformation.weight,
          height: Userinformation.height,
          gender: Userinformation.gender,
          bloodGroup: Userinformation.bloodGroup,
          imagePath: Userinformation.imageUrl,
          municipalityId: parseInt(Userinformation.location.Locationid),
          streetAddress: Userinformation.location.Address,
          dateOfBirth: Userinformation.DOB,
          associatedHospitalIdList: HospitalId,
          experience:Userinformation.experience,
          specialization:Userinformation.speciality,
          education:Userinformation.qualification,
          nmcLicenseNo:Userinformation.NMCno
      }
    }).then((res) => {
         setUserInformation((prevState) => {
               return {...prevState,message:res.data.message,loading:false,error:false}
         })
     })
    .catch(error => {
      setUserInformation((prevState) => {
        return {...prevState,message:error?.response?.data?.data[0],error:true}
       })
    });

  }

  const onSubmit = (event) => {
   
    event.preventDefault(); 
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("upload_preset", "mi8kekc6");
    data.append("cloud_name", "dwo9yx1r8");
    axios("https://api.cloudinary.com/v1_1/dwo9yx1r8/image/upload",{
       method : "post",
       data : data
    }).then((res) => {
       console.log(res.data.url);
       setUserInformation((prevState) => {
           return {...prevState,imageUrl:res?.data?.url}
       })
     }).then(() => PostData())
    .catch((error) => {
        if(error) {
          setUserInformation((prevState) => {
             return {...prevState,message:"Please check the form.",error:true}
           })
        }
     })
  };

  return (
    <FormContext.Provider
      value={{
        selectedFile,
        previewImage,
        setSelectedFile,
        setPreviewImage,

        Userinformation,
        setUserInformation,
      

        formArray,
        formNo,
        setFormNo,
        AddHospital,
        RemoveHospital,

        next: next,
        prev: prev,
        onSubmit,
      }}
    >
      {props.children}
    </FormContext.Provider>
  );
};

export default FormContextProvider;
