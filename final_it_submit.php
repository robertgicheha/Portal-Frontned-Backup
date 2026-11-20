<?php

// POST /api/it_policy_awareness/final_it_submit
//
// Finalises an attempt after the last answer has been submitted. NAV is the
// source of the score, chapters, time taken and date; this endpoint never
// computes any of them locally.
//
// Body:
// {
//   "token": "...", "empNumber": "...", "attemptNo": 1, "entity": "...",
//   "name": "...", "department": "...", "chaptersViewed": 6,
//   "chaptersTotal": 6, "timeTakenSeconds": 300
// }
//
// NAV (submitQuestions) returns:
// {"error":false,"message":"Success","data":{
//   "scorepercentage": 91.67, "timeTaken": "20.20:08:48.2490000",
//   "chapters": "6", "name": "...", "empID": "...", "entity": "...",
//   "department": "...", "date": "2026-11-17T09:07:08.462Z" }}
//
// Response:
// { status, message, data: { ...NAV's data, untouched... },
//   attemptNo, totalQuestions, correctAnswers, passed, completed, completedDate }
//
// The descriptive body fields (name/department/chapters/time) are only a
// fallback for the org-wide completion log when NAV doesn't return them.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// CORS headers come from IIS ("CORS Anywhere"), so none are set here.
// The browser sends an OPTIONS preflight first (custom X-Internal-Token header
// + JSON body). Answer it before anything that could reject it -- otherwise it
// gets a 405 and the browser reports the real POST as a CORS failure.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'METHOD_NOT_ALLOWED',
        'message' => 'Method not allowed.',
    ]);
    exit;
}

// Read the body before inc-api-defaults.php reads php://input.
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input);

if (json_last_error() !== JSON_ERROR_NONE || !is_object($data)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'INVALID_PAYLOAD',
        'message' => 'Invalid JSON payload.',
    ]);
    exit;
}

// Resolve the shared secret from .env/$_ENV/getenv/$_SERVER. phpdotenv v4
// populates $_ENV rather than getenv(), so all three are checked.
$secret = (string)(
    $_ENV['IT_POLICY_AWARENESS_SECRET']
    ?? getenv('IT_POLICY_AWARENESS_SECRET')
    ?: ($_SERVER['IT_POLICY_AWARENESS_SECRET'] ?? '')
);

// An empty/unset variable must never become the secret -- otherwise an empty
// token would pass and the real one would be rejected. Same fallback as
// submit_it_answers.php; must match IT_POLICY_AWARENESS_SECRET in
// public/resources/it-policy-awareness.html.
if ($secret === '') {
    $secret = 'lp!tP:H0TwN)wB9v';
}

$inbound   = (string)($_SERVER['HTTP_X_INTERNAL_TOKEN'] ?? '');
$bodyToken = trim((string)($data->token ?? ''));

if (!hash_equals($secret, $inbound) && !hash_equals($secret, $bodyToken)) {
    http_response_code(401);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'UNAUTHORIZED',
        'message' => 'Unauthorized',
    ]);
    exit;
}

// The deployed portal uses models/ITPolicyAwareness.php; the local/staging
// copy still uses models/PolicyAwareness.php. Load whichever exists before
// inc-api-defaults.php instantiates the model.
$autoload = __DIR__ . '/../../vendor/autoload.php';
if (is_file($autoload)) {
    require_once $autoload;
}

$deployedModel = __DIR__ . '/../../models/ITPolicyAwareness.php';
$localModel    = __DIR__ . '/../../models/PolicyAwareness.php';
if (is_file($deployedModel)) {
    require_once $deployedModel;
} elseif (is_file($localModel)) {
    require_once $localModel;
}

include_once __DIR__ . '/../inc-api-defaults.php';

$empNumber = trim((string)($data->empNumber ?? $data->employeeId ?? $data->employeeNo ?? ''));
if ($empNumber === '' || !preg_match('/^[A-Za-z0-9\-_.]{1,20}$/', $empNumber)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'INVALID_EMPLOYEE',
        'message' => 'empNumber is required and must be valid.',
    ]);
    exit;
}

$attemptNo = trim((string)($data->attemptNo ?? ''));
if ($attemptNo === '' || !preg_match('/^[A-Za-z0-9\-]{1,30}$/', $attemptNo)) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'INVALID_ATTEMPT',
        'message' => 'attemptNo is required and must be valid.',
    ]);
    exit;
}

$entity = trim((string)($data->entity ?? ''));
if ($entity === '') {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'INVALID_ENTITY',
        'message' => 'entity is required.',
    ]);
    exit;
}

$model = null;
if (isset($it_policy_awareness) && is_object($it_policy_awareness)) {
    $model = $it_policy_awareness;
} elseif (isset($policy_awareness) && is_object($policy_awareness)) {
    $model = $policy_awareness;
} elseif (class_exists('ITPolicyAwareness')) {
    // inc-api-defaults.php doesn't create the model -- build it here, the same
    // way submit_it_answers.php does.
    $model = new ITPolicyAwareness();
} elseif (class_exists('PolicyAwareness')) {
    $model = new PolicyAwareness();
}

if ($model === null || !method_exists($model, 'setNavUrlByEntity')) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'MODEL_UNAVAILABLE',
        'message' => 'The training model is not available.',
    ]);
    exit;
}

if ($model->setNavUrlByEntity($entity) === false) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'INVALID_ENTITY',
        'message' => 'entity must match a known company (MIC or EHS).',
    ]);
    exit;
}

$name             = trim((string)($data->name ?? ''));
$department       = trim((string)($data->department ?? ''));
$chaptersViewed   = max(0, (int)($data->chaptersViewed ?? 0));
$chaptersTotal    = max(0, (int)($data->chaptersTotal ?? 0));
$timeTakenSeconds = isset($data->timeTakenSeconds) && $data->timeTakenSeconds !== null
    ? max(0, (int)$data->timeTakenSeconds)
    : null;

try {
    // The deployed model exposes submitQuestions(empNumber, attemptNo). The
    // fallbacks keep this endpoint usable with the staging model and with any
    // rename that keeps the same semantics.
    if (method_exists($model, 'submitQuestions')) {
        $result = $model->submitQuestions($empNumber, $attemptNo);
    } elseif (method_exists($model, 'finalSubmit')) {
        $result = $model->finalSubmit($empNumber, $attemptNo);
    } elseif (method_exists($model, 'completeTrainingAttempt')) {
        $result = $model->completeTrainingAttempt($attemptNo);
    } else {
        throw new Exception('The training model does not expose a final-submit operation.');
    }

    // NAV returns Text, so $result may be a JSON string (possibly with extra
    // characters around it), an object, or an array. Normalise to an array.
    if (is_string($result)) {
        $rawResult = trim($result);
        $decoded   = json_decode($rawResult, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
            $start   = strpos($rawResult, '{');
            $end     = strrpos($rawResult, '}');
            $decoded = ($start !== false && $end !== false && $end > $start)
                ? json_decode(substr($rawResult, $start, $end - $start + 1), true)
                : null;
        }
        $result = is_array($decoded) ? $decoded : ['message' => $rawResult];
    } elseif (is_object($result)) {
        $result = json_decode(json_encode($result), true) ?: [];
    } elseif (!is_array($result)) {
        $result = [];
    }

    // An explicit error:true from NAV is a business rejection, not a success.
    if (isset($result['error']) && filter_var($result['error'], FILTER_VALIDATE_BOOLEAN)) {
        http_response_code(422);
        $navMessage = (string)($result['message'] ?? 'NAV rejected the submission.');
        error_log('❌ it_policy_awareness/final_it_submit.php NAV rejected ' . $empNumber . ' attempt ' . $attemptNo . ': ' . $navMessage);
        echo json_encode([
            'status'  => 'error',
            'code'    => 'NAV_ERROR',
            'message' => $navMessage,
        ]);
        exit;
    }

    $navMessage = (string)($result['message'] ?? 'Success');

    // NAV's data block, passed through untouched. Older model versions return
    // the fields at the top level instead of under "data".
    $navData = (isset($result['data']) && is_array($result['data'])) ? $result['data'] : $result;
    unset($navData['status'], $navData['error']);

    $totalQuestions  = (int)($navData['totalQuestions'] ?? $navData['total'] ?? 0);
    $correctAnswers  = (int)($navData['correctAnswers'] ?? 0);
    $passed          = (bool)($navData['passed'] ?? false);
    $completed       = (bool)($navData['completed'] ?? true);
    $completedDate   = trim((string)($navData['date'] ?? $navData['completedDate'] ?? '')) ?: date('c');
    $returnedAttempt = trim((string)($navData['attemptNo'] ?? '')) ?: $attemptNo;

    // Record the completion for the admin-only org-wide log, preferring NAV's
    // values. A logging failure must never turn a successful NAV submission
    // into an error.
    try {
        // A missing file in require_once is a fatal error that try/catch can't
        // stop, so check first rather than let it kill a successful submit.
        $storeFile = __DIR__ . '/completions-store.php';
        if (!is_file($storeFile)) {
            throw new Exception('completions-store.php not found');
        }
        require_once $storeFile;
        if (!function_exists('itpa_append_completion')) {
            throw new Exception('itpa_append_completion() is not defined');
        }
        itpa_append_completion([
            'name'             => trim((string)($navData['name'] ?? '')) ?: $name,
            'employeeId'       => trim((string)($navData['empID'] ?? '')) ?: $empNumber,
            'entity'           => trim((string)($navData['entity'] ?? '')) ?: $entity,
            'department'       => trim((string)($navData['department'] ?? '')) ?: $department,
            'chaptersViewed'   => isset($navData['chapters']) ? (int)$navData['chapters'] : $chaptersViewed,
            'chaptersTotal'    => $chaptersTotal,
            'attemptNo'        => $returnedAttempt,
            'score'            => $correctAnswers,
            'total'            => $totalQuestions,
            'scorePercentage'  => $navData['scorepercentage'] ?? null,
            'passed'           => $passed,
            'timeTaken'        => $navData['timeTaken'] ?? null,
            'timeTakenSeconds' => $timeTakenSeconds,
            'timestamp'        => $completedDate,
        ]);
    } catch (Throwable $logError) {
        error_log('❌ it_policy_awareness/final_it_submit.php completion log failed: ' . $logError->getMessage());
    }

    echo json_encode([
        'status'         => 'success',
        'message'        => $navMessage,
        'data'           => $navData,
        'attemptNo'      => $returnedAttempt,
        'totalQuestions' => $totalQuestions,
        'correctAnswers' => $correctAnswers,
        'passed'         => $passed,
        'completed'      => $completed,
        'completedDate'  => $completedDate,
    ]);
} catch (NavServiceException $e) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'code'    => $e->navCode,
        'message' => $e->getMessage(),
    ]);
} catch (Throwable $e) {
    error_log('❌ it_policy_awareness/final_it_submit.php exception: ' . $e->getMessage());
    http_response_code(502);
    echo json_encode([
        'status'  => 'error',
        'code'    => 'NAV_UNAVAILABLE',
        'message' => 'Could not submit the final answers: ' . $e->getMessage(),
    ]);
}
