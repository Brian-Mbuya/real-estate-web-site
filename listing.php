<?php
// Reality Kisumu Hub - Smart Recommendation Engine (PHP Mode)
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "real_estate";

$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);
$db_connected = !$conn->connect_error;

// User inputs
$budget = isset($_GET['budget']) && is_numeric($_GET['budget']) ? (float)$_GET['budget'] : 25000000;
$preferredLocation = isset($_GET['location']) ? trim($_GET['location']) : '';
$preferredType = isset($_GET['type']) ? trim($_GET['type']) : '';
$minBedrooms = isset($_GET['bedrooms']) && is_numeric($_GET['bedrooms']) ? (int)$_GET['bedrooms'] : 0;

$properties = [];

if ($db_connected) {
    $locationParam = "%" . $preferredLocation . "%";
    
    $sql = "
    SELECT *,
    (
        CASE
            WHEN price BETWEEN (? * 0.8) AND (? * 1.2) THEN 35
            WHEN price BETWEEN (? * 0.6) AND (? * 1.4) THEN 25
            WHEN price BETWEEN (? * 0.4) AND (? * 1.6) THEN 15
            ELSE 5
        END
        +
        CASE
            WHEN ? != '' AND location LIKE ? THEN 35
            ELSE 0
        END
        +
        CASE
            WHEN ? != '' AND (type = ? OR category = ?) THEN 20
            ELSE 0
        END
        +
        CASE
            WHEN bedrooms >= ? AND ? > 0 THEN 10
            ELSE 0
        END
    ) AS smart_score
    FROM properties
    ORDER BY smart_score DESC, price ASC
    ";

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param(
            "ddddddssssi",
            $budget, $budget,
            $budget, $budget,
            $budget, $budget,
            $preferredLocation, $locationParam,
            $preferredType, $preferredType, $preferredType,
            $minBedrooms, $minBedrooms
        );
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $properties[] = $row;
        }
        $stmt->close();
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Smart Search (PHP) - Reality Kisumu Hub</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Main Design System CSS -->
    <link rel="stylesheet" href="assets/css/main.css">
</head>
<body class="bg-light">

    <!-- Header / Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-3">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
                <span class="fs-4">🏠</span>
                <span>Reality Kisumu Hub</span>
            </a>
            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
                    <li class="nav-item"><a class="nav-link fw-medium" href="index.html">Home</a></li>
                    <li class="nav-item"><a class="nav-link fw-medium" href="house.html">Browse Houses</a></li>
                    <li class="nav-item"><a class="nav-link active fw-medium text-warning" href="listing.php">Smart Search (PHP)</a></li>
                    <li class="nav-item"><a class="nav-link fw-medium" href="liked.html">Favorites ❤️</a></li>
                </ul>
                <div class="d-flex align-items-center gap-2">
                    <a href="login.html" class="btn btn-outline-light btn-sm px-3 fw-semibold">Login</a>
                    <a href="signup.html" class="btn btn-gold btn-sm px-3">Sign Up</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Header Banner -->
    <header class="bg-dark text-white py-4 mb-4 border-bottom border-secondary">
        <div class="container text-center">
            <h1 class="h2 fw-bold mb-1">🧠 Smart Recommendation Engine (PHP & MySQL)</h1>
            <p class="text-secondary mb-0">Listings dynamically ordered by multi-signal SQL CASE weight algorithms.</p>
        </div>
    </header>

    <div class="container mb-5">
        <!-- Filter Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <form method="GET" class="row g-3">
                <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Target Budget (KSh)</label>
                    <input type="number" name="budget" class="form-control" value="<?php echo htmlspecialchars($budget); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Preferred Location</label>
                    <input type="text" name="location" class="form-control" placeholder="e.g. Milimani, Riat" value="<?php echo htmlspecialchars($preferredLocation); ?>">
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted">Property Type</label>
                    <select name="type" class="form-select">
                        <option value="">Any Type</option>
                        <option value="Apartment" <?php echo $preferredType === 'Apartment' ? 'selected' : ''; ?>>Apartment</option>
                        <option value="Villa" <?php echo $preferredType === 'Villa' ? 'selected' : ''; ?>>Villa</option>
                        <option value="Bungalow" <?php echo $preferredType === 'Bungalow' ? 'selected' : ''; ?>>Bungalow</option>
                        <option value="Land" <?php echo $preferredType === 'Land' ? 'selected' : ''; ?>>Land</option>
                    </select>
                </div>

                <div class="col-md-3 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary-custom w-100 fw-bold py-2">
                        Calculate Relevance & Rank
                    </button>
                </div>
            </form>
        </div>

        <?php if (!$db_connected): ?>
            <div class="alert alert-warning text-center rounded-4 p-4 shadow-sm">
                <h5 class="fw-bold mb-2">MySQL Database Offline</h5>
                <p class="mb-0">Import <code>schema.sql</code> into MySQL database <code>real_estate</code> to run live server-side scoring. In the meantime, try browser smart ranking on <a href="house.html" class="alert-link">house.html</a>!</p>
            </div>
        <?php else: ?>
            <div class="row g-4">
                <?php if (empty($properties)): ?>
                    <div class="col-12"><div class="alert alert-info text-center rounded-4 p-4">No properties found matching your criteria.</div></div>
                <?php else: ?>
                    <?php foreach ($properties as $row): ?>
                        <div class="col-md-6">
                            <div class="property-card-modern p-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <h5 class="fw-bold mb-0"><?php echo htmlspecialchars($row['title']); ?></h5>
                                        <span class="badge bg-primary fw-bold">🌟 Match: <?php echo htmlspecialchars($row['smart_score']); ?>/100</span>
                                    </div>
                                    <p class="text-primary fw-bold fs-4 mb-2">KSh <?php echo number_format($row['price']); ?></p>
                                    <p class="text-muted small mb-3">
                                        📍 <strong>Location:</strong> <?php echo htmlspecialchars($row['location']); ?> |
                                        🏠 <strong>Category:</strong> <?php echo htmlspecialchars($row['category']); ?> |
                                        🛏️ <strong>Beds:</strong> <?php echo htmlspecialchars($row['bedrooms']); ?>
                                    </p>
                                    <p class="small text-secondary mb-3"><?php echo htmlspecialchars($row['description']); ?></p>
                                </div>
                                <div class="pt-3 border-top">
                                    <a href="https://wa.me/254746672821?text=<?php echo urlencode('Hi, inquiring about: ' . $row['title']); ?>" target="_blank" class="btn btn-success btn-sm fw-semibold w-100">
                                        💬 WhatsApp Agent
                                    </a>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Footer -->
    <footer class="bg-dark text-white py-4 mt-5 border-top border-secondary">
        <div class="container text-center small text-secondary">
            &copy; 2026 Reality Kisumu Hub. All rights reserved.
        </div>
    </footer>

    <!-- Bootstrap JS Bundle CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
