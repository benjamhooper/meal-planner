import Alexa from 'ask-sdk-core';

const API_URL = process.env.API_URL;       // https://meals.benhooper.org/api/v1/mealplan/today
const API_KEY = process.env.ALEXA_API_KEY; // matches Alexa:ApiKey in the .NET API

async function getTodaysMeals() {
    const res = await fetch(API_URL, {
        headers: { 'X-Alexa-Key': API_KEY }
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return res.json();
}

function buildSpeech(meals) {
    const parts = [];
    if (meals.breakfast) parts.push(`Breakfast is ${meals.breakfast}.`);
    if (meals.lunch)     parts.push(`Lunch is ${meals.lunch}.`);
    if (meals.dinner)    parts.push(`Dinner is ${meals.dinner}.`);

    if (parts.length === 0)
        return `You don't have anything planned for today, ${meals.date}.`;

    return `Here's what's on the menu for ${meals.date}. ${parts.join(' ')}`;
}

const GetTodaysMealsHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(input.requestEnvelope) === 'GetTodaysMealsIntent';
    },
    async handle(input) {
        try {
            const meals = await getTodaysMeals();
            return input.responseBuilder
                .speak(buildSpeech(meals))
                .getResponse();
        } catch (e) {
            return input.responseBuilder
                .speak("Sorry, I couldn't reach the meal planner right now.")
                .getResponse();
        }
    }
};

const LaunchHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'LaunchRequest';
    },
    async handle(input) {
        try {
            const meals = await getTodaysMeals();
            return input.responseBuilder
                .speak(buildSpeech(meals))
                .getResponse();
        } catch (e) {
            return input.responseBuilder
                .speak("Sorry, I couldn't reach the meal planner right now.")
                .getResponse();
        }
    }
};

const SessionEndedHandler = {
    canHandle(input) {
        return Alexa.getRequestType(input.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(input) {
        return input.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() { return true; },
    handle(input, error) {
        console.error('Error:', error);
        return input.responseBuilder
            .speak("Sorry, something went wrong with the meal planner.")
            .getResponse();
    }
};

export const handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(LaunchHandler, GetTodaysMealsHandler, SessionEndedHandler)
    .addErrorHandlers(ErrorHandler)
    .create()
    .invoke;
