import { Controller, Get, NotFoundException, Param, Req, UseFilters, UseGuards } from "@nestjs/common";
import { GameService } from "./game.service";
import JwtAuthGuard from "../../auth/guard/jwt-auth.guard";
import { IRequestWithUser } from "src/auth/auths.interface";
import { IdDto } from "src/utils/dto/users.dto";
import { TooLargeFilter } from "src/utils/filters/redirection.filter";

@UseFilters(TooLargeFilter)
@UseGuards(JwtAuthGuard)
@Controller("games")
export class GamesController {
    constructor(private readonly gameService: GameService) {}

    @Get("running")
    getRunningGames() {
        return this.gameService.getRunningGames();
    }
    @Get("users")
    getUserInGames() {
        return this.gameService.userInGameAnnounceStandalone();
    }
    @Get("play/:id")
    getPlayGame(@Req() request: IRequestWithUser, @Param() gameId: IdDto) {
        const games = this.gameService.getRunningGames();
        const game = games.find((game) => game.gameId === gameId.id && (game.playerOneName === request.user.username || game.playerTwoName === request.user.username));
        if (!game) throw new NotFoundException();
        return "OK";
    }
    @Get("watch/:id")
    getWatchGame(@Param() gameId: IdDto) {
        const games = this.gameService.getRunningGames();
        const game = games.find((game) => game.gameId === gameId.id);
        if (!game) throw new NotFoundException();
        return "OK";
    }
}
