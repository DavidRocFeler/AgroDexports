"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let AuthGuard = class AuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers["authorization"]?.split(" ")[1] ?? "";
        console.log(token ? 'AuthGuard: Token found' : 'AuthGuard: No token provided');
        if (!token) {
            throw new common_1.UnauthorizedException("Bearer token not found ");
        }
        else {
            const secret = process.env.JWT_SECRET;
            try {
                const payload = this.jwtService.verify(token, { secret });
                if (payload) {
                    console.log('AuthGuard: Token is valid');
                    payload.iat = new Date(payload.iat * 1000);
                    payload.exp = new Date(payload.exp * 1000);
                    console.log(`AuthGuard: Payload - User ID: ${payload.user_id}, Role: ${payload.role}`);
                    request.user = {
                        ...payload,
                        user_id: payload.user_id,
                        role: payload.role,
                    };
                    return true;
                }
            }
            catch (error) {
                console.log('AuthGuard: Invalid token detected');
                throw new common_1.UnauthorizedException("Invalid Token");
            }
        }
        console.log('AuthGuard: Unhandled case');
        return false;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map