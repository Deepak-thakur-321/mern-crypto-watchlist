import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import { FaRegCopy, FaShareAlt } from "react-icons/fa";

export default function Referral() {
   const { user } = useAuth();
   const [referral, setReferral] = useState(null);
   const [copied, setCopied] = useState(false);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchReferral = async () => {
         try {
            const { data } = await axiosInstance.get("/referral");
            setReferral(data.referral || data.user);
         } catch (err) {
            console.error(err);
            toast.error("Failed to fetch referral info");
         } finally {
            setLoading(false);
         }
      };
      if (user) fetchReferral();
   }, [user]);

   if (!user) {
      return (
         <div style={styles.container}>
            <h2 style={styles.heading}>Referral Program</h2>
            <p style={styles.text}>Please log in to access your referral information.</p>
         </div>
      );
   }

   if (loading) {
      return <div style={styles.container}><p>Loading referral details...</p></div>;
   }

const validCodes = ["DUMMY123", "MYCODE", "TEST2025"];
const referralCode = referral?.referralCode ?? user?.referralCode ?? validCodes[0];
const referralLink = `${window.location.origin}/register?ref=${referralCode}`;



   const handleCopy = () => {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
   };


   const handleShare = async () => {
      if (navigator.share) {
         try {
            await navigator.share({
               title: "Join this platform",
               text: "Sign up using my referral link!",
               url: referralLink,
            });
         } catch {
            toast.error("Failed to share");
         }
      } else {
         toast("Sharing not supported on this device.");
      }
   };

   return (
      <div style={styles.container}>
         <h2 style={styles.heading}>Referral Program</h2>
         <p style={styles.text}>
            Share your referral code or link with friends and earn rewards when they sign up.
         </p>

         <div style={styles.card}>
            <h3 style={styles.subHeading}>Your Referral Code</h3>
            <div style={styles.codeContainer}>
               <span style={styles.code}>{referralCode}</span>
               <button style={styles.button} onClick={handleCopy}>
                  <FaRegCopy style={{ marginRight: 5 }} />
                  {copied ? "Copied!" : "Copy"}
               </button>
            </div>

            <h3 style={{ ...styles.subHeading, marginTop: 20 }}>Your Referral Link</h3>
            <div style={styles.codeContainer}>
               <span style={styles.link}>{referralLink}</span>
               <button style={styles.button} onClick={handleShare}>
                  <FaShareAlt style={{ marginRight: 5 }} />
                  Share
               </button>
            </div>

            <p style={{ ...styles.text, marginTop: 20 }}>
               When someone signs up using your referral link, they will automatically be linked to your account, unlocking rewards for both of you.
            </p>
         </div>
      </div>
   );
}

const styles = {
   container: {
      maxWidth: 600,
      margin: "50px auto",
      padding: 20,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      textAlign: "center",
   },
   heading: { fontSize: 32, marginBottom: 10, color: "#333" },
   subHeading: { fontSize: 20, marginBottom: 10, color: "#555" },
   text: { fontSize: 16, color: "#666" },
   card: {
      marginTop: 30,
      padding: 30,
      borderRadius: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      textAlign: "left",
   },
   codeContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      backgroundColor: "#f9f9f9",
      padding: "10px 15px",
      borderRadius: 6,
      wordBreak: "break-all",
   },
   code: { fontWeight: 600, fontSize: 16, color: "#222" },
   link: { fontSize: 14, color: "#007bff", wordBreak: "break-all" },
   button: {
      display: "flex",
      alignItems: "center",
      padding: "6px 12px",
      fontSize: 14,
      fontWeight: 500,
      color: "#fff",
      backgroundColor: "#007bff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      transition: "all 0.2s ease",
   },
};
