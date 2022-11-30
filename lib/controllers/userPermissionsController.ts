import { Request, Response } from 'express';
import CommonService from '../modules/common/service';
import UserPermissionsService from '../modules/userPermissions/service';
import { IUserPermissions } from '../modules/userPermissions/model';

export class UserPermissionsController {
  private UserPermissionsService: UserPermissionsService = new UserPermissionsService();
  public getUserPermissions(req: Request, res: Response) {
    if (req.params.id) {
      const permissionFilter = {
        user: req.params.id,
      };
      this.UserPermissionsService.filterUser(
        permissionFilter,
        (err: any, userPermissionsData: IUserPermissions) => {
          if (err) {
            CommonService.mongoError(err, res);
          } else {
            CommonService.successResponse(
              'User permissions retrieved successfully',
              userPermissionsData,
              res
            );
          }
        }
      );
    }
  }
  public updateUserPermissions(req: Request | any, res: Response) {
    const {
      showMyConnectionTime = false,
      confirmWhenLeavingAMeeting = false,
      showSubtitles = false,
      showNonVideoParticipants = false,
      muteMicrophone = false,
      autoConnectAudio = false,
      useOriginalAudio = false,
      turnOffVideo = false,
    } = req.body;
    if (
      showMyConnectionTime ||
      confirmWhenLeavingAMeeting ||
      showSubtitles ||
      showNonVideoParticipants ||
      muteMicrophone ||
      autoConnectAudio ||
      useOriginalAudio ||
      turnOffVideo
    ) {
      const userFilter = {
        user: req.params.id,
      };
      this.UserPermissionsService.filterUser(
        userFilter,
        (err: any, userPermissionsData: IUserPermissions) => {
          if (err) {
            CommonService.mongoError(err, res);
          } else if (userPermissionsData) {
            userPermissionsData.modificationNotes.push({
              modifiedOn: new Date(),
              modifiedBy: req.user.id,
              modificationNote: 'User Permissions Updated Successfully',
            });
            const permissionsParams: IUserPermissions = {
              user: req.params.id,
              general: {
                showMyConnectionTime: showMyConnectionTime
                  ? showMyConnectionTime
                  : userPermissionsData.general.showMyConnectionTime,
                confirmWhenLeavingAMeeting: confirmWhenLeavingAMeeting
                  ? confirmWhenLeavingAMeeting
                  : userPermissionsData.general.confirmWhenLeavingAMeeting,
                showSubtitles: showSubtitles
                  ? showSubtitles
                  : userPermissionsData.general.showSubtitles,
                showNonVideoParticipants: showNonVideoParticipants
                  ? showNonVideoParticipants
                  : userPermissionsData.general.showNonVideoParticipants,
              },
              audio: {
                muteMicrophone: muteMicrophone
                  ? muteMicrophone
                  : userPermissionsData.audio.muteMicrophone,
                autoConnectAudio: autoConnectAudio
                  ? autoConnectAudio
                  : userPermissionsData.audio.autoConnectAudio,
                useOriginalAudio: useOriginalAudio
                  ? useOriginalAudio
                  : userPermissionsData.audio.useOriginalAudio,
              },
              video: {
                turnOffVideo: turnOffVideo ? turnOffVideo : userPermissionsData.video.turnOffVideo,
              },
              modificationNotes: userPermissionsData.modificationNotes,
            };
            this.UserPermissionsService.updatePermissions(
              permissionsParams,
              async (err: any, updatedUserPermissionsData: IUserPermissions | any) => {
                if (err) {
                  CommonService.mongoError(err, res);
                } else {
                  return CommonService.successResponse(
                    'User Permissions Updated Successfully',
                    updatedUserPermissionsData,
                    res
                  );
                }
              }
            );
          } else {
            CommonService.failureResponse('invalid user', null, res);
          }
        }
      );
    } else {
      CommonService.insufficientParameters(res);
    }
  }
}
