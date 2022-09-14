import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import { convertHourStringToMinutes } from "./utils/convertHourStringToMinutes";
import { convertMinutesToHourString } from "./utils/convertMinutesToHourString";

const app = express();
app.use(express.json());
app.use(cors());

const prisma = new PrismaClient();

app.get("/games", async (req, res) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return res.json(games);
});

app.get("/games/:id/ads", (req, res) => {
  const { id } = req.params;

  const games = [
    { id: 1, name: "CS" },
    { id: 2, name: "LOL" },
    { id: 3, name: "DOTA" },
    { id: 4, name: "APEX" },
    { id: 5, name: "BDO" },
  ];

  const game = games.find((game) => game.id === Number(id));

  return res.json({ game });
});

/////////////////////////////////////////////////////////

app.post("/games/:id/ads", async (req, res) => {
  const gameId = req.params.id;
  const body: any = req.body;

  const ad = await prisma.ad.create({
    data: {
      ...body,
      gameId,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
    },
  });

  return res.status(201).json(ad);
});

app.get("/ads/:gameId/ads", async (req, res) => {
  const { gameId } = req.params;

  let ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json(
    ads.map((ad) => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHourString(ad.hourStart),
        hourEnd: convertMinutesToHourString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (req, res) => {
  const { id } = req.params;

  const discord = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id,
    },
  });

  return res.json(discord);
});

app.listen(3333);
