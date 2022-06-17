const Bukkit = org.bukkit.Bukkit;
const WorldCreator = org.bukkit.WorldCreator;
const World = org.bukkit.World;
const WorldType = org.bukkit.WorldType;

const utils = require("utils");

/*utils.array(FileUtils.class.getDeclaredMethods()).forEach((element) => {
		console.log(element.toString());
	});*/

let currentWorld = Bukkit.getServer().getWorld("world");

events.playerJoin((event) => {
	echo(event.player, "Pregatit sa o dam?");

	if (event.player.world !== currentWorld) {
		event.player.teleport(currentWorld.getSpawnLocation());
		console.log(
			"Teleporting stray player " + event.player.name + " to " + currentWorld
		);
	}
});

command("reset", (args, player) => {
	Bukkit.broadcastMessage("Creating world...");
	const wc = new WorldCreator(Date.now());

	wc.environment(World.Environment.NORMAL);
	wc.type(WorldType.NORMAL);

	const newWorld = wc.createWorld();
	currentWorld = newWorld;

	utils.foreach(utils.players(), (_player) => {
		echo(_player, "Teleported to " + newWorld.getName());
		_player.teleport(newWorld.getSpawnLocation());
	});

	utils.foreach(utils.worlds(), (_world) => {
		if (_world !== newWorld) {
			Bukkit.getServer().unloadWorld(_world, false);
		}
	});
});

command("test", (args, player) => {});
