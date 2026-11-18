import Card from "./Card.jsx";

function EmptyState() {
    return (
        <Card
            className={'border-dashed border-2 h-30 border-gray flex items-center justify-center p-3 '}>
            <h3 className={'text-gray-600 text-semibold '}>No items to display yet.</h3>
        </Card>
    );
}

export default EmptyState;