// src/app/api/item/[item_id]/route.js 
import { getClientPromise } from "@/lib/mongodb"; 
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils"; 
import { ObjectId } from "mongodb"; 
export async function GET(request, { params }) { 
  const { item_id } = await params; 
  // Validate ObjectId syntax first
  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid ID format", 400);
  }
  try { 
    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    const item = await db 
      .collection("item") 
      .findOne({ _id: new ObjectId(item_id), status: { $ne: "DELETED" } }); 
    if (item) { 
      return successResponse( 
        { 
          item, 
        }, 
        200, 
      ); 
    } else return errorResponse("Item not found", 404); 
  } catch (error) { 
    printExceptionLog("GET Item Exception", error); 
    return errorResponse("GET Item Internal Error", 500); 
  } 
} 
export async function DELETE(request, { params }) { 
  const { item_id } = await params; 
  // Validate ObjectId syntax first
  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid ID format", 400);
  }
  try { 
    const client = await getClientPromise(); 
    const db = client.db(process.env.DB_NAME); 
    const deleteResult = await db 
      .collection("item") 
      .updateOne(
        { _id: new ObjectId(item_id) , status: { $ne: "DELETED" } },
        { $set: { status: "DELETED" } }
    ); 
    if (deleteResult.modifiedCount > 0) {
      return successResponse({ message: "Delete Success" }, 200);
    }
    return errorResponse("Item not found or already deleted", 404); 
  } catch (error) { 
    printExceptionLog("DELETE Item Exception", error); 
    return errorResponse("DELETE Item Internal Error", 500); 
  } 
} 
// export async function PUT(request, { params }) { 
//   const { item_id } = await params; 
//   // Validate ObjectId syntax first
//   if (!ObjectId.isValid(item_id)) {
//     return errorResponse("Invalid ID format", 400);
//   }
// //   console.log("==>itemd id: ", item_id); 
//   try { 
//     const data = await request.json(); 
//     const client = await getClientPromise(); 
//     const db = client.db(process.env.DB_NAME); 

//     const storedItem = await db 
//       .collection("item") 
//       .findOne({ 
//         _id: new ObjectId(item_id),
//         status: { $ne: "DELETED" },
//     }); 
//     if (storedItem) { 
//       storedItem.name = data.name; 
//       storedItem.price = data.price; 
//       storedItem.amount = data.amount; 
//       storedItem.category = data.category; 
//       const updatedResult = await db 
//         .collection("item") 
//         .updateOne({ _id: new ObjectId(item_id) }, { $set: storedItem }); 
//       console.log("==>update result: ", updatedResult); 
//       const updateOk = Number(updatedResult.modifiedCount) > 0; 
//       if (updateOk) 
//         return successResponse({ message: "Item update success" }, 201); 
//       else return errorResponse({ message: "Item update failed" }, 400); 
//     } else { 
//       return errorResponse({ message: "Item not found" }, 400); 
//     } 
//   } catch (error) { 
//     printExceptionLog("PUT Item Exception", error); 
//     return errorResponse("PUT Item Internal Error", 500); 
//   } 
// } 

export async function PUT(request, { params }) {
  const { item_id } = await params;

  // Validate ObjectId syntax first
  if (!ObjectId.isValid(item_id)) {
    return errorResponse("Invalid ID format", 400);
  }

  try {
    const data = await request.json();
    const client = await getClientPromise();
    const db = client.db(process.env.DB_NAME);

    // Update only specific fields, avoiding _id modification
    const updatedResult = await db.collection("item").updateOne(
      { _id: new ObjectId(item_id), status: { $ne: "DELETED" } },
      {
        $set: {
          name: data.name,
          category: data.category,
          price: data.price,
          amount: data.amount,
        },
      }
    );

    // Check if a document was found and matched
    if (updatedResult.matchedCount > 0) {
      return successResponse({ message: "Item update success" }, 200);
    }
    
    return errorResponse("Item not found", 404);
  } catch (error) {
    printExceptionLog("PUT Item Exception", error);
    return errorResponse("PUT Item Internal Error", 500);
  }
}