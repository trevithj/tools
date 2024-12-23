// Proper PubSub methods, to allow broadcasting messages to multiple nodes.
// The subscribe function returns an unsubscribe fn.
// This version works with node as well as browser-side.
const subscriberMap = {};

function doPublish(subject, message) {
    const subscribers = subscriberMap[subject] || [];
    subscribers.forEach(subFn => {
        if (subFn && typeof subFn === "function") {
            subFn(message);
        }
    })
}

export function publish(subject, message, runImmediately) {
    if (runImmediately) {
        doPublish(subject, message);
    } else {
        setTimeout(() => {
            doPublish(subject, message);
        }, 0); // end publish fn immediately. Leave execution to next execution block.
    }
}

export function subscribe(subject, subFn) {
    if (typeof subFn === 'function') {
        const subscribers = subscriberMap[subject] || [];
        subscribers.push(subFn);
        subscriberMap[subject] = subscribers;
        return () => subscriberMap[subject] = subscriberMap[subject].filter(fn => fn !== subFn);
    }
}
