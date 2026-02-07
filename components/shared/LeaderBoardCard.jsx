// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// export default function LeaderboardCard({
//   rank,
//   name,
//   phone,
//   avatar,
//   scores,
//   total,
// }) {
//   return (
//     <div className="flex items-center bg-[#243643] rounded-lg mb-2 px-3 py-1.5 shadow-md">
//       <div className="font-bold text-2xl text-[#b5cec8] w-12 text-center">
//         {rank}
//       </div>
//       <Avatar className="w-10 h-10 mx-2 ring ring-[#15252f]">
//         <AvatarImage src={avatar} alt={name} />
//         <AvatarFallback>{name[0]}</AvatarFallback>
//       </Avatar>
//       <div className="flex-1 ml-1">
//         <div className="font-semibold text-[#e9eaea] text-sm leading-tight">
//           {name}
//         </div>
//         <div className="text-xs text-[#7ea1af]">{phone}</div>
//       </div>

//       <div className="flex flex-col mt-2">
//         {/* Numbering Row */}
//         <div className="flex">
//           {scores.map((_, idx) => (
//             <div
//               key={idx}
//               className="w-7 h-4 mx-0.5 flex items-center justify-center text-sm text-gray-300"
//             >
//               {idx + 1}
//             </div>
//           ))}
//         </div>
//         {/* Score Row */}
//         <div className="flex">
//           {scores.map((score, idx) => (
//             <div
//               key={idx}
//               className={`w-7 h-7 mx-0.5 grid place-items-center rounded ${
//                 score ? "bg-white text-[#092733] font-bold" : "bg-[#324a5e]"
//               }`}
//             >
//               {score ?? ""}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="font-extrabold text-xl w-10 text-right text-[#fdf7c3] ml-3">
//         {total}
//       </div>
//     </div>
//   );
// }






// =========================

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function LeaderboardCard({
  rank,
  name,
  phone,
  avatar,
  scores,
  total,
}) {
  return (
    <div className="flex items-center border-2 border-[#7ea1af] bg-[#243643] rounded-lg mb-2 px-3 py-1.5 shadow-md">
      <div className="font-bold text-2xl text-[#b5cec8] w-12 text-center">{rank}</div>
      
      <Avatar className="w-10 h-10 mx-2 ring-2 ring-[#15252f] overflow-hidden shrink-0">
        <AvatarImage src={avatar} alt={name} className="object-cover w-full h-full" />
        <AvatarFallback className="bg-[#7ea1af] text-[#243643] font-bold text-lg flex items-center justify-center w-full h-full rounded">
          {name?.[0] ?? ""}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 ml-1">
        <div className="font-semibold text-[#e9eaea] text-sm leading-tight">{name}</div>
        <div className="text-xs text-[#7ea1af]">{phone}</div>
      </div>

      <div className="flex flex-col mt-2">
        {/* Numbering Row */}
        <div className="flex">
          {scores.map((_, idx) => (
            <div
              key={idx}
              className="w-7 h-4 mx-0.5 flex items-center justify-center text-sm text-gray-300"
            >
              {idx + 1}
            </div>
          ))}
        </div>
        
        {/* Score Row */}
        <div className="flex">
          {scores.map((score, idx) => (
            <div
              key={idx}
              className={`w-7 h-7 mx-0.5 grid place-items-center rounded border-2 ${
                score
                  ? "bg-white text-[#092733] border-[#7ea1af] font-bold"
                  : "bg-[#324a5e] border-[#324a5e]"
              }`}
            >
              {score ?? ""}
            </div>
          ))}
        </div>
      </div>

      <div className="font-extrabold text-xl w-10 text-right text-[#fdf7c3] ml-3">{total}</div>
    </div>
  );
}
