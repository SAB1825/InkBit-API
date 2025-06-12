import { createComment, deleteComment, getCommentsByBlog, getCommentsByUser, updateComment } from "@/controllers/v1/comment.controller";
import { CheckApiKeyMiddleware } from "@/middlewares/api-key";
import { AuthMiddleware } from "@/middlewares/auth";
import { Router } from "express";

const router = Router();
router.post("/blog/:blogId/comments",CheckApiKeyMiddleware,AuthMiddleware, createComment);           
router.get("/blog/:blogId/comments", CheckApiKeyMiddleware,AuthMiddleware,getCommentsByBlog);      
router.get("/user/:userId/comments", CheckApiKeyMiddleware,AuthMiddleware,getCommentsByUser);        
router.put("/comments/:commentId", CheckApiKeyMiddleware,AuthMiddleware,updateComment);             
router.delete("/comments/:commentId", CheckApiKeyMiddleware,AuthMiddleware,deleteComment);       

export const commentRoutes = router;