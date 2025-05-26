import { useContext } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { set } from "mongoose";
import { useEffect } from "react";
import { useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  //function to all users from sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {}); // Ensure it's always an object

        // For debugging:
        console.log("Users:", data.users);
        console.log("Unseen Messages:", data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  //function to get messages for selected user

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        console.log("Messages fetched:", data.messages);
        setMessages(data.messages);
        // setSelectedUser(userId);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user;

  const subscribeToMessages = (userId) => {
    if (!socket) return;

    socket.emit("join-room", userId);

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/seen/${newMessage._id}`);
      } else {
        setUnseenMessages((prevUnseenMessages) => {
          return {
            ...prevUnseenMessages,
            [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
              ? prevUnseenMessages[newMessage.senderId] + 1
              : 1,
          };
        });
      }
    });
  };

  // function to   unsubscribe from messages for selected user;

  const unsubscribeFromMessages = (userId) => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  const value = {
    messages,
    setMessages,
    users,
    setUsers,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
