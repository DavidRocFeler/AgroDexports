// "use client"
// import React, { useEffect } from 'react';
// import { useSession } from "next-auth/react";
// import { useUserStore } from "@/store/useUserStore";
// import { IUser } from "@/interface/types";

// const UserList: React.FC = () => {
//     const { data: session } = useSession();
//     const users = useUserStore((state) => state.users);
//     const removeUser = useUserStore((state) => state.removeUser);
//     const clearUsers = useUserStore((state) => state.clearUsers);
//     const addUser = useUserStore((state) => state.addUser);

//     useEffect(() => {
//         if (session?.user) {
//             const sessionUser: IUser = {
//                 id: session.user.id || Date.now().toString(),
//                 user_name: session.user.name || "",
//                 email: session.user.email || "",
//                 role_name: localStorage.getItem('userRole') as "supplier" | "buyer",
//                 user_lastname: "",
//                 password: "",
//                 confirm_password: "",
//                 isOlder: true,
//             };
            
//             if (!users.some(user => user.id === sessionUser.id)) {
//                 addUser(sessionUser);
//             }
//         }
//     }, [session]);

//     useEffect(() => {
//         console.log("Users in global state:", users);
//     }, [users]);

//     const handleDeleteUser = (userId: string) => {
//         removeUser(userId);
//     };

//     const handleClearAllUsers = () => {
//         if (window.confirm('Are you sure you want to delete all users?')) {
//             clearUsers();
//         }
//     };

//     return (
//         <div className="p-4">
//             <h2 className="text-2xl font-bold mb-4">Registered Users</h2>
//             {users.length === 0 ? (
//                 <p>No users registered yet.</p>
//             ) : (
//                 <>
//                     <ul className="space-y-2">
//                         {users.map((user: IUser) => (
//                             <li key={user.id} className="border p-2 rounded flex justify-between items-center">
//                                 <span>
//                                     <strong>{user.user_name}</strong> - {user.email} - Role: {user.role_name || 'Not set'}
//                                     {session?.user?.email === user.email && " (Current User)"}
//                                 </span>
//                                 <button 
//                                     onClick={() => handleDeleteUser(user.id)}
//                                     className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
//                                     disabled={session?.user?.email === user.email}
//                                 >
//                                     Delete
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                     <button 
//                         onClick={handleClearAllUsers}
//                         className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                     >
//                         Clear All Users
//                     </button>
//                 </>
//             )}
//         </div>
//     );
// };

// export default UserList;
