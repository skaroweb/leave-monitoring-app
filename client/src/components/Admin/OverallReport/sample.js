// const result2 = filteredResult.reduce((acc, cur) => {
//   const { currentuserid, absencetype, status, reason, permissionTime } =
//     cur;

//   if (status === "approve") {
//     // Initialize leave duration in days and hours
//     let leaveDays = 0;
//     let leaveHours = 0;

//     // Calculate leave duration in days based on absence type
//     if (absencetype === "half day") {
//       leaveHours = 4;
//     } else if (absencetype !== "half day" && reason !== "Permission") {
//       leaveDays = 1;
//     }

//     // If permission time exists, calculate leave hours
//     if (reason === "Permission" && permissionTime) {
//       // Convert permission time to hours and add to leave hours
//       leaveHours += parseInt(permissionTime);
//     }

//     // Convert leave hours to days if applicable
//     if (leaveHours >= 4) {
//       const additionalDays = Math.floor(leaveHours / 4) * 0.5;
//       leaveDays += additionalDays;
//       leaveHours %= 4;
//     }

//     // Update accumulator
//     if (currentuserid in acc) {
//       acc[currentuserid].days += leaveDays;
//       acc[currentuserid].hours += leaveHours;
//     } else {
//       acc[currentuserid] = {
//         days: leaveDays,
//         hours: leaveHours,
//       };
//     }
//   }

//   return acc;
// }, {});

// // Adjust the total days and hours if needed
// for (const userId in result2) {
//   let { days, hours } = result2[userId];

//   // Convert remaining hours to days if applicable
//   if (hours >= 4) {
//     const additionalDays = Math.floor(hours / 4) * 0.5;
//     days += additionalDays;
//     hours %= 4;
//   }

//   result2[userId] = { days, hours };
// }

//   console.log(result2);

// const result = filteredResult
//   // .filter(
//   //   (obj) => new Date(obj.applydate).getFullYear() === selectedYear
//   // )
//   .reduce((acc, cur) => {
//     const {
//       currentuserid,
//       absencetype,
//       status,
//       reason,
//       permissionTime,
//     } = cur;
//     if (status === "approve") {
//       if (reason !== "Permission") {
//         if (currentuserid in acc) {
//           acc[currentuserid]++;
//         } else {
//           acc[currentuserid] = 1;
//         }
//         //   console.log(acc[currentuserid]);
//       } else {
//         // Convert permission time to days
//         const permissionDays = parseInt(permissionTime) / 8; // Assuming 8 hours is one day

//         if (currentuserid in acc) {
//           acc[currentuserid] += permissionDays;
//         } else {
//           acc[currentuserid] = permissionDays;
//         }
//       }
//     }

//     if (absencetype === "half day" && status !== "reject") {
//       if (currentuserid in acc) {
//         acc[currentuserid] -= 0.5;
//       } else {
//         acc[currentuserid] = -0.5;
//       }
//     }

//     return acc;
//   }, {});

//   console.log(result);
