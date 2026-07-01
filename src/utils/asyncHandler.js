const asyncHandler = (requestHandler) => {

    return async (req, res, next) => {

        console.log("Type of next:", typeof next);

        try {

            await requestHandler(req, res, next);

        } catch (error) {

            console.log("Caught Error:", error);
            console.log("Type of next inside catch:", typeof next);

            if (typeof next !== "function") {
                console.log("❌ next is not a function");
                throw error;
            }

            next(error);

        }

    };

};

export default asyncHandler;