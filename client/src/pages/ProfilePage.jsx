import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      //console.log("Base64 Image:", base64Image);
      await updateProfile({ fullName: name, bio, profilePic: base64Image });
      navigate("/");
    };
  };

  // Function to get the profile picture source
  const getProfilePicSrc = () => {
    if (selectedImage) {
      // Show newly selected image preview
      return URL.createObjectURL(selectedImage);
    } else if (authUser?.profilePic) {
      // Show existing profile picture from database
      return authUser.profilePic;
    } else {
      // Show default avatar
      return assets.avatar_icon;
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat 
    flex items-center justify-center"
    >
      <div
        className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300
       border-2 border-gray-600 flex items-center justify-between
        max-sm:flex-col-reverse rounded-lg"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>
          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              onChange={(e) => setSelectedImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={getProfilePicSrc() || "/placeholder.svg"}
              alt="Profile"
              className={`w-12 h-12 object-cover ${
                selectedImage || authUser?.profilePic ? "rounded-full" : ""
              }`}
            />
            {authUser?.profilePic
              ? "Change Profile Image"
              : "Upload Profile Image"}{" "}
            v
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            required
            value={name}
            placeholder="Your Name"
            className="p-2 border border-gray-500 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio..."
            required
            value={bio}
            className="p-2 border border-gray-500 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={4}
          ></textarea>

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600
           text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        {/* Large profile picture display */}
        <div className="mx-10 max-sm:mt-10">
          <img
            className={`max-w-44 aspect-square object-cover ${
              selectedImage || authUser?.profilePic ? "rounded-full" : ""
            }`}
            src={getProfilePicSrc() || "/placeholder.svg"}
            alt="Profile Preview"
          />
          {authUser?.profilePic && !selectedImage && (
            <p className="text-center text-sm text-gray-400 mt-2">
              Current Profile Picture
            </p>
          )}
          {selectedImage && (
            <p className="text-center text-sm text-green-400 mt-2">
              New Image Preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
