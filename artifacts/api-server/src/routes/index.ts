import { Router, type IRouter } from "express";
import healthRouter from "./health";
import subjectsRouter from "./subjects";
import learningRouter from "./learning";
import resourcesRouter from "./resources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(subjectsRouter);
router.use(learningRouter);
router.use(resourcesRouter);

export default router;
