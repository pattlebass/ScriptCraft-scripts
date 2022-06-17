const events = require("events");
const utils = require("utils");

const registeredPlayers = {};

function registerPlayer(player) {
	if (registeredPlayers[player]) return;
	registeredPlayers[player] = {
		distance: 2, //player.getClientViewDistance(),
		interval: null,
	};
	console.log(JSON.stringify(registeredPlayers));
}

command("toggleSpawnerCount", (args, player) => {
	registerPlayer(player);

	if (registeredPlayers[player].interval) {
		clearInterval(registeredPlayers[player].interval);
		registeredPlayers[player].interval = null;
		return;
	}

	registeredPlayers[player].interval = setInterval(
		function updateSpawnerDisplay() {
			const tiles = getTilesAroundPlayer(
				player,
				registeredPlayers[player].distance
			);
			//console.log(JSON.stringify(tiles));
			sendActionBar(
				player,
				"Spawner: " +
					((tiles.spawner / tiles.total) * 100 || 0).toFixed(2) +
					"%"
			);
		},
		1000
	);
});

command("uprender", (args, player) => {
	registerPlayer(player);

	if (registeredPlayers[player].distance >= 32) {
		echo(player, "Scanning distance: 32 (max)");
		return;
	}

	registeredPlayers[player].distance += 2;
	echo(player, "Scanning distance: " + registeredPlayers[player].distance);
});

command("downrender", (args, player) => {
	registerPlayer(player);
	if (registeredPlayers[player].distance <= 2) {
		echo(player, "Scanning distance: 2 (min)");
		return;
	}

	registeredPlayers[player].distance -= 2;
	echo(player, "Scanning distance: " + registeredPlayers[player].distance);
});

events.playerQuit((event) => {
	if (
		registeredPlayers[event.player] &&
		registeredPlayers[event.player].interval !== null
	) {
		clearInterval(registeredPlayers[event.player].interval);
	}
	registeredPlayers[event.player] = null;
});

function getTilesAroundPlayer(player, n) {
	const tiles = { total: 0 };

	utils.foreach(getChunksAroundPlayer(player, n), (chunk) => {
		utils.foreach(chunk.getTileEntities(), (tile) => {
			const block = tile.getBlock().getType().toString().toLowerCase();
			if (block in tiles) {
				tiles[block]++;
			} else {
				tiles[block] = 1;
			}
			tiles.total++;
		});
	});
	return tiles;
}

function getChunksAroundPlayer(player, n) {
	const playerChunkPosX = player.getLocation().getChunk().getX();
	const playerChunkPosZ = player.getLocation().getChunk().getZ();

	const chunks = [];

	for (let x = playerChunkPosX - n; x <= playerChunkPosX + n; x++) {
		for (let z = playerChunkPosZ - n; z <= playerChunkPosZ + n; z++) {
			chunks.push(player.world.getChunkAt(x, z));
		}
	}

	return chunks;
}

function sendActionBar(player, message) {
	const ChatMessageType = Packages.net.md_5.bungee.api.ChatMessageType;
	const TextComponent = Packages.net.md_5.bungee.api.chat.TextComponent;

	player
		.spigot()
		.sendMessage(
			ChatMessageType.ACTION_BAR,
			TextComponent.fromLegacyText(message)
		);
}
