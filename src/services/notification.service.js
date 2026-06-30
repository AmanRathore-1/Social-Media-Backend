import Notification from "../models/notification.model.js";

export const createNotification = async ({
    sender,
    receiver,
    type,
    post = null,
    comment = null
}) => {

    // Don't notify yourself
    if (sender.toString() === receiver.toString()) {
        return null;
    }

    return await Notification.create({
        sender,
        receiver,
        type,
        post,
        comment
    });

};