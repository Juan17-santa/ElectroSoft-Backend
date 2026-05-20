import RoleEntity from "../domain/RoleEntity.js";

export default class GetValidPermissionsUseCase {
  execute() {
    return {
      all: RoleEntity.validPermissions,
      byModule: RoleEntity.permissionsByModule,
    };
  }
}